/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  UserCheck,
  Shield,
  History,
  CloudRain,
  Sparkles,
  Award,
  Cpu,
  Compass,
  Wrench,
  RotateCcw,
  Flag,
  Flame,
  Info,
  Calendar,
  AlertTriangle,
  Zap,
  Brain,
  Wind,
  Heart,
  Share2,
  Trophy,
  Play,
  Dices,
  Lock,
  Volume2,
  CheckCircle,
  HelpCircle,
  EyeOff,
  ChevronRight,
  Eye,
  ChevronDown,
  Sparkle
} from 'lucide-react';
import { GAME_SLOTS, CIRCUITS, SEASONS_TEAMS, getRandomComboExcept, evaluateQualityRank, detectCombos } from './data';
import { runChampionshipSimulation } from './simulation';
import { GameSlot, TeamCombination, ActiveCombo, SlotType } from './types';
import { RadarChart } from './components/RadarChart';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Active Buff Cards declared outside Component
const BUFF_CARDS = [
  {
    id: 'drs',
    name: '🚀 DRS Infinito',
    description: 'Abre a asa móvel nas retas e curvas amplas! Seus dois pilotos ganham +12 posições médias ou sobem para o topo do grid.',
    color: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    icon: 'Zap',
  },
  {
    id: 'party_mode',
    name: '🔥 Modo Festa no Motor',
    description: 'Bota o motor para queimar no limite supremo! Seu Piloto Principal 1 é jogado diretamente para a P1 nesta rodada.',
    color: 'border-purple-500/80 bg-purple-950/40 text-purple-400 font-bold shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    icon: 'Flame',
  },
  {
    id: 'shield',
    name: '🛡️ Mureta Blindada',
    description: 'Reverte qualquer colisão ou falha mecânica! Desfaz DNFs de seus pilotos e os coloca em uma posição segura na disputa de pontos.',
    color: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    icon: 'Shield',
  },
  {
    id: 'stop_iceman',
    name: '🍦 Sorvete Strategic Masterclass',
    description: 'Parada perfeita e pit stop épico de 1.8 segundos sob safety-car. Garante pódio duplo para sua escuderia.',
    color: 'border-amber-500/80 bg-amber-950/40 text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    icon: 'Award',
  },
  {
    id: 'forced_rain',
    name: '🌧️ Dança da Chuva',
    description: 'Sua equipe sabota a mureta adversária com previsão de tempestade tática. Seu especialista ou pilotos ganham vantagem total (+8 posições).',
    color: 'border-blue-500/80 bg-blue-950/40 text-sky-400 font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    icon: 'CloudRain',
  },
  {
    id: 'multi21',
    name: '🏆 Ordem "Multi 31" Reversa',
    description: 'Inverte agressivamente as posições de equipe, fazendo o seu Piloto 2 (Segundo Titular) assumir a P1 e vencer a prova!',
    color: 'border-pink-500/80 bg-pink-950/40 text-pink-400 font-bold shadow-[0_0_15px_rgba(236,72,153,0.15)]',
    icon: 'Sparkles',
  }
];

// Icon Map helper to resolve lucide icons
const IconMap: Record<string, React.ComponentType<any>> = {
  User,
  UserCheck,
  Shield,
  History,
  CloudRain,
  Sparkles,
  Award,
  Cpu,
  Compass,
  Wrench,
};

const tipIconMap: Record<string, React.ComponentType<any>> = {
  sparkles: Sparkles,
  zap: Zap,
  brain: Brain,
  wind: Wind,
  heart: Heart,
  alert: AlertTriangle,
  info: Info
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505] border border-[#222] p-2.5 rounded shadow-xl font-mono text-[10px] space-y-1.5">
        <p className="text-gray-400 font-bold border-b border-[#222] pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-3 justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
              <span className="text-gray-300">{entry.name}</span>
            </span>
            <span className="font-bold text-white">{entry.value} pts</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface SavedSession {
  id: string;
  timestamp: string;
  seed: string;
  overallRating: number;
  rank: { rank: string; color: string };
  champion: string;
  points: number;
}

export default function App() {
  // Navigation & States
  const [difficultyMode, setDifficultyMode] = useState<'normal' | 'hard' | 'underdog'>('normal');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [slots, setSlots] = useState<Record<string, any>>({});
  const [jokerAvailable, setJokerAvailable] = useState<boolean>(true);
  const [activeCombo, setActiveCombo] = useState<TeamCombination | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Buff cards states
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [selectedCardToUse, setSelectedCardToUse] = useState<any | null>(null);
  const [activeBuffModals, setActiveBuffModals] = useState<boolean>(false);
  const [buffHistory, setBuffHistory] = useState<string[]>([]);

  const [gameMode, setGameMode] = useState<'home' | 'draft' | 'simulating' | 'results' | 'duelo'>('home');
  const [duelPreviousMode, setDuelPreviousMode] = useState<'home' | 'results'>('home');
  const [duelCompetitorA, setDuelCompetitorA] = useState<any>(null);
  const [duelCompetitorB, setDuelCompetitorB] = useState<any>(null);
  const [dnfStressMultiplier, setDnfStressMultiplier] = useState<number>(100);
  const [dnfDuelResult, setDnfDuelResult] = useState<string | null>(null);
  const [autoScaleStress, setAutoScaleStress] = useState<boolean>(true);

  // Live Duel Status & Telemetry States
  const [isLiveDuelActive, setIsLiveDuelActive] = useState<boolean>(false);
  const [liveDuelLap, setLiveDuelLap] = useState<number>(0);
  const [liveDuelFinished, setLiveDuelFinished] = useState<boolean>(false);
  const [liveDuelLogs, setLiveDuelLogs] = useState<string[]>([]);
  const [liveDuelWinner, setLiveDuelWinner] = useState<string | null>(null);
  const [liveStatsA, setLiveStatsA] = useState({ speed: 0, throttle: 0, brake: 0, temp: 80, score: 0, status: 'Pronto' });
  const [liveStatsB, setLiveStatsB] = useState({ speed: 0, throttle: 0, brake: 0, temp: 80, score: 0, status: 'Pronto' });
  const [liveSector, setLiveSector] = useState<'Reta' | 'Curva' | 'Chuva' | 'S' | 'Mista'>('Reta');
  const [circuitFilter, setCircuitFilter] = useState<'all' | 'rua' | 'técnico' | 'veloz' | 'clássico' | 'wet'>('all');

  const liveDuelTimerRef = React.useRef<any>(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (liveDuelTimerRef.current) {
        clearInterval(liveDuelTimerRef.current);
      }
    };
  }, []);

  // Force stop live duel if game mode changes
  useEffect(() => {
    if (gameMode !== 'duelo') {
      setIsLiveDuelActive(false);
      setLiveDuelFinished(false);
      if (liveDuelTimerRef.current) {
        clearInterval(liveDuelTimerRef.current);
        liveDuelTimerRef.current = null;
      }
    }
  }, [gameMode]);

  // Automatically calculate fair stress if autoScaleStress is enabled
  useEffect(() => {
    if (autoScaleStress && duelCompetitorA && duelCompetitorB) {
      const relA = duelCompetitorA.reliability || 90;
      const relB = duelCompetitorB.reliability || 90;
      const avgReliability = (relA + relB) / 2;
      
      const aggA = duelCompetitorA.aggressiveness || 80;
      const aggB = duelCompetitorB.aggressiveness || 80;
      const avgAggVal = (aggA + aggB) / 2;

      const baseRisk = ((100 - avgReliability) * 0.18 + avgAggVal * 0.05);
      if (baseRisk > 0) {
        // baseRisk * (multiplier / 100) * 1.5 = 12% target balanced risk
        // multiplier = 800 / baseRisk
        const fairMultiplier = Math.max(20, Math.min(200, Math.round(800 / baseRisk)));
        setDnfStressMultiplier(fairMultiplier);
      }
    }
  }, [autoScaleStress, duelCompetitorA?.id, duelCompetitorB?.id, duelCompetitorA?.reliability, duelCompetitorB?.reliability, duelCompetitorA?.aggressiveness, duelCompetitorB?.aggressiveness]);

  // Extract all historical drivers from SEASONS_TEAMS
  const historicalDrivers = React.useMemo(() => {
    const list: any[] = [];
    SEASONS_TEAMS.forEach(team => {
      team.drivers.forEach(drv => {
        // Prevent duplicate seasons by giving unique key
        const key = `${drv.id}_${team.season}`;
        if (!list.some(d => d.id_season === key)) {
          list.push({
            ...drv,
            id_season: key,
            sourceTeam: team.teamName,
            sourceSeason: team.season,
            displayName: `${drv.name} (${team.season})`
          });
        }
      });
    });
    return list;
  }, []);

  // Unified list of selectable drivers for duel mode
  const selectableDriversList = React.useMemo(() => {
    const list: any[] = [];
    
    // Add user's active drafted drivers if they exist
    const userDriver1 = slots['driver_1'];
    const userDriver2 = slots['driver_2'];
    const userReserve1 = slots['reserve_1'];
    const userReserve2 = slots['reserve_2'];
    const userWetRef = slots['wet_specialist'];
    const userLegacy = slots['legacy_wildcard'];

    if (userDriver1) {
      list.push({
        ...userDriver1,
        id_season: 'user_driver_1',
        sourceTeam: 'Sua Equipe (Titular 1)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userDriver1.name} (Seu Titular 1)`
      });
    }
    if (userDriver2) {
      list.push({
        ...userDriver2,
        id_season: 'user_driver_2',
        sourceTeam: 'Sua Equipe (Titular 2)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userDriver2.name} (Seu Titular 2)`
      });
    }
    if (userWetRef) {
      list.push({
        ...userWetRef,
        id_season: 'user_wet',
        sourceTeam: 'Sua Equipe (Chuva)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userWetRef.name} (Seu Especialista de Chuva)`
      });
    }
    if (userReserve1) {
      list.push({
        ...userReserve1,
        id_season: 'user_reserve_1',
        sourceTeam: 'Sua Equipe (Reserva 1)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userReserve1.name} (Seu Reserva 1)`
      });
    }
    if (userReserve2) {
      list.push({
        ...userReserve2,
        id_season: 'user_reserve_2',
        sourceTeam: 'Sua Equipe (Histórico)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userReserve2.name} (Seu Histórico/Reserva)`
      });
    }
    if (userLegacy) {
      list.push({
        ...userLegacy,
        id_season: 'user_legacy',
        sourceTeam: 'Sua Equipe (Coringa)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userLegacy.name} (Seu Coringa de Legado)`
      });
    }

    // Add historical drivers
    historicalDrivers.forEach(d => {
      list.push(d);
    });

    return list;
  }, [slots, historicalDrivers]);

  // Set default draft drivers on start / change
  useEffect(() => {
    if (!duelCompetitorA && historicalDrivers.length > 0) {
      const senna = historicalDrivers.find(d => d.id === 'senna_1988') || historicalDrivers[0];
      setDuelCompetitorA(senna);
    }
    if (!duelCompetitorB && historicalDrivers.length > 1) {
      const schumi = historicalDrivers.find(d => d.id === 'schumacher_2004') || historicalDrivers[1];
      setDuelCompetitorB(schumi);
    }
  }, [historicalDrivers, duelCompetitorA, duelCompetitorB]);

  const handleSimulateIncidentDuel = () => {
    if (!duelCompetitorA || !duelCompetitorB) return;
    
    // Play an alert chime sequence
    playBeep(880, 0.08);
    setTimeout(() => playBeep(523, 0.08), 90);
    setTimeout(() => playBeep(659, 0.15), 180);

    // Compute individualized crash risks based on reliability, aggressiveness and stressMultiplier
    const relFactorA = 100 - (duelCompetitorA.reliability || 90);
    const aggFactorA = duelCompetitorA.aggressiveness || 80;
    const baseRiskA = (relFactorA * 0.18 + aggFactorA * 0.05);
    const riskA = Math.min(98, Math.max(2, baseRiskA * (dnfStressMultiplier / 100) * 1.5));

    const relFactorB = 100 - (duelCompetitorB.reliability || 90);
    const aggFactorB = duelCompetitorB.aggressiveness || 80;
    const baseRiskB = (relFactorB * 0.18 + aggFactorB * 0.05);
    const riskB = Math.min(98, Math.max(2, baseRiskB * (dnfStressMultiplier / 100) * 1.5));

    const rollA = Math.random() * 100;
    const rollB = Math.random() * 100;

    const experiencesIncidentA = rollA < riskA;
    const experiencesIncidentB = rollB < riskB;

    const incidentsList = [
      'estouro repentino de turbocompressor de alta pressão nas retas de alta de Monza',
      'colisão roda-a-roda disputando o vácuo agressivo e tangência extrema na curva Tamburello',
      'perda catastrófica de pressão eletroidráulica limitando a atuação da embreagem',
      'estouro severo do pneu dianteiro mordendo com fúria a zebra de alta velocidade',
      'vazamento repentino de óleo quente provocando princípio de chamas no escape',
      'estouro da vedação do cárter devido à altíssima rotação e temperaturas agressivas',
      'falha de fiação eletrônica crônica em virtude da ressonância de vibração do chassi'
    ];

    const pickIncident = () => incidentsList[Math.floor(Math.random() * incidentsList.length)];

    let report = '';
    if (experiencesIncidentA && experiencesIncidentB) {
      report = `🚨 CATÁSTROFE MECÂNICA DUPLA! Diante do estresse extremo ajustado em ${dnfStressMultiplier}%, Ambos os competidores sofreram DNFs simultâneos nas últimas voltas! O carro de ${duelCompetitorA.name} sofreu ${pickIncident()}, enquanto o adversário ${duelCompetitorB.name} quebrou alegando ${pickIncident()}. Nenhum carro viu a bandeirada de largada!`;
    } else if (experiencesIncidentA) {
      report = `💥 DESISTÊNCIA/DNF DO COMPETIDOR A! O motor e suspensão de ${duelCompetitorA.name} não resistiram à fadiga sob o multiplicador de ${dnfStressMultiplier}% de estresse. O veículo abandonou a pista após um(a) ${pickIncident()}. ${duelCompetitorB.name} cruzou a linha de forma espetacular com excelente integridade (Telemetria 100% Estável)!`;
    } else if (experiencesIncidentB) {
      report = `💥 DESISTÊNCIA/DNF DO COMPETIDOR B! Sob a sobrecarga agressiva de ${dnfStressMultiplier}%, o sistema pneumático de ${duelCompetitorB.name} cedeu nas curvas de apoio traseiro, forçando DNF por conta de um(a) ${pickIncident()}. Enquanto isso, o carro de ${duelCompetitorA.name} operou em perfeitas condições de pressão mecânica!`;
    } else {
      report = `✅ DUPLO SUCESSO! Ambos os bólidos de corrida operaram com excepcional refinamento térmico e completaram o percurso sob estresse agressivo severo de ${dnfStressMultiplier}%. Sem toques na pista nem fumaça azul. ${duelCompetitorA.name} e ${duelCompetitorB.name} viram a bandeirada xadrez intactos!`;
    }

    setDnfDuelResult(report);
  };

  const handleStopLiveDuel = () => {
    setIsLiveDuelActive(false);
    setLiveDuelFinished(false);
    if (liveDuelTimerRef.current) {
      clearInterval(liveDuelTimerRef.current);
      liveDuelTimerRef.current = null;
    }
    setLiveDuelLogs(prev => [`🛑 SIMULAÇÃO LIVE INTERROMPIDA PELO DIRETOR DE PROVA.`, ...prev]);
    playBeep(440, 0.1);
  };

  const handleStartLiveDuel = () => {
    if (!duelCompetitorA || !duelCompetitorB) return;

    // Reset everything
    setIsLiveDuelActive(true);
    setLiveDuelFinished(false);
    setLiveDuelWinner(null);
    setLiveDuelLap(1);
    
    // Initial logs
    const initialLogs = [
      `🚥 SINAL VERDE! Os motores V10/V8 rugem no grid de largada!`,
      `🏁 Início da Batalha de Telemetria em Tempo Real (Live Modo): ${duelCompetitorA.name} vs ${duelCompetitorB.name}!`,
    ];
    setLiveDuelLogs(initialLogs);

    // Initial stats
    setLiveStatsA({ speed: 312, throttle: 100, brake: 0, temp: 80, score: 0, status: 'ATIVO' });
    setLiveStatsB({ speed: 308, throttle: 100, brake: 0, temp: 80, score: 0, status: 'ATIVO' });
    setLiveSector('Reta');

    playBeep(880, 0.08);
    setTimeout(() => playBeep(880, 0.08), 90);
    setTimeout(() => playBeep(1200, 0.2), 180);

    let currentLap = 1;
    let scoreA = 0;
    let scoreB = 0;
    let tempA = 75;
    let tempB = 75;
    let isFinished = false;

    if (liveDuelTimerRef.current) {
      clearInterval(liveDuelTimerRef.current);
    }

    liveDuelTimerRef.current = setInterval(() => {
      if (isFinished) {
        clearInterval(liveDuelTimerRef.current);
        return;
      }

      currentLap += 1;
      if (currentLap > 10) {
        // End of duel
        isFinished = true;
        setIsLiveDuelActive(false);
        setLiveDuelFinished(true);
        clearInterval(liveDuelTimerRef.current);

        const diffFinal = scoreA - scoreB;
        let finalWinner = '';
        let recap = '';

        if (Math.abs(diffFinal) < 15) {
          finalWinner = 'Empate';
          recap = `🏁 BANDEIRA QUADRADA! Empate técnico inacreditável na linha de chegada! Ambos cruzaram separados por milésimos de segundo de pura adrenalina de telemetria!`;
        } else if (scoreA > scoreB) {
          finalWinner = duelCompetitorA.name;
          recap = `🏆 BANDEIRA QUADRADA! ${duelCompetitorA.name} cruza em P1! O bólido vermelho assegurou passagens perfeitas por dentro nos setores sinuosos, garantindo a vitória sobre ${duelCompetitorB.name}!`;
        } else {
          finalWinner = duelCompetitorB.name;
          recap = `🏆 BANDEIRA QUADRADA! ${duelCompetitorB.name} vence o duelo! O competidor ciano executou um vácuo perfeito e superou ${duelCompetitorA.name} nas retas de velocidade!`;
        }

        setLiveDuelWinner(finalWinner);
        setLiveDuelLogs(prev => [recap, ...prev]);
        setLiveStatsA(prev => ({ ...prev, speed: 0, throttle: 0, brake: 0, status: scoreA > scoreB ? 'VENCEDOR' : 'FINALIZADO' }));
        setLiveStatsB(prev => ({ ...prev, speed: 0, throttle: 0, brake: 0, status: scoreB > scoreA ? 'VENCEDOR' : 'FINALIZADO' }));
        
        // Victory song/sequence
        playBeep(880, 0.1);
        setTimeout(() => playBeep(1100, 0.1), 120);
        setTimeout(() => playBeep(1320, 0.25), 240);
        return;
      }

      setLiveDuelLap(currentLap);

      // Define sector conditions
      const sectorsList: ('Reta' | 'Curva' | 'Chuva' | 'S' | 'Mista')[] = ['Reta', 'S', 'Curva', 'Reta', 'Chuva', 'Curva', 'Mista', 'Reta', 'S', 'Reta'];
      const sector = sectorsList[currentLap - 1] || 'Mista';
      setLiveSector(sector);

      // Speeds according to driver properties
      const baseSpeed = sector === 'Reta' ? 315 : sector === 'Curva' ? 180 : sector === 'Chuva' ? 140 : 250;
      const driverAPaceBonus = (duelCompetitorA.pace || 80) * 0.35 + (sector === 'Chuva' ? (duelCompetitorA.chuva || 80) * 0.4 : 0);
      const driverBPaceBonus = (duelCompetitorB.pace || 80) * 0.35 + (sector === 'Chuva' ? (duelCompetitorB.chuva || 80) * 0.4 : 0);

      const randA = Math.random() * 15;
      const randB = Math.random() * 15;

      const actSpeedA = Math.round(baseSpeed + driverAPaceBonus + randA);
      const actSpeedB = Math.round(baseSpeed + driverBPaceBonus + randB);

      // Rising temperatures based on aggressiveness
      const aggA = (duelCompetitorA.aggressiveness || 80);
      const aggB = (duelCompetitorB.aggressiveness || 80);
      tempA = Math.round(tempA + (aggA / 55) + Math.random() * 3);
      tempB = Math.round(tempB + (aggB / 55) + Math.random() * 3);

      // Scores (integrated distance / advantage)
      scoreA += actSpeedA;
      scoreB += actSpeedB;

      // Incident (DNF) check per lap based on current temperature and reliability
      const relA = (duelCompetitorA.reliability || 90);
      const relB = (duelCompetitorB.reliability || 90);

      // Risk formula scaled with temperature & dnfStressMultiplier support
      const riskFactorA = ((110 - relA) * 0.012 + (tempA > 115 ? (tempA - 115) * 0.06 : 0)) * (dnfStressMultiplier / 100);
      const riskFactorB = ((110 - relB) * 0.012 + (tempB > 115 ? (tempB - 110) * 0.06 : 0)) * (dnfStressMultiplier / 100);

      const crashRollA = Math.random() * 100;
      const crashRollB = Math.random() * 100;

      let crashA = crashRollA < (riskFactorA * 4);
      let crashB = crashRollB < (riskFactorB * 4);

      const incidentsList = [
        'perdeu o controle físico de traseira e rodou espetacularmente na zebra pintada',
        'teve pane severa de ignição elétrica com emissão de fumaça cinza-azulada',
        'sofreu uma explosão repentina e espetacular do pneu dianteiro esquerdo',
        'teve quebra fulminante da junta homocinética traseira na aceleração',
        'superaqueceu o radiador de óleo e teve que recolher para a garagem dos boxes',
        'danificou as aletas móveis da asa traseira, perdendo toda pressão aerodinâmica'
      ];
      const pickStory = () => incidentsList[Math.floor(Math.random() * incidentsList.length)];

      if (crashA && crashB) {
        isFinished = true;
        setIsLiveDuelActive(false);
        setLiveDuelFinished(true);
        setLiveDuelWinner('Ambos Fora');
        clearInterval(liveDuelTimerRef.current);

        const crashLog = `🚨 CATÁSTROFE MECÂNICA DUPLA NA VOLTA ${currentLap}! Ambos os competidores abandonaram a pista! ${duelCompetitorA.name} ${pickStory()} e ${duelCompetitorB.name} simultaneamente ${pickStory()}! Telemetria completamente offline!`;
        setLiveDuelLogs(prev => [crashLog, ...prev]);

        setLiveStatsA({ speed: 0, throttle: 0, brake: 0, temp: tempA, score: scoreA, status: '💥 DNF' });
        setLiveStatsB({ speed: 0, throttle: 0, brake: 0, temp: tempB, score: scoreB, status: '💥 DNF' });
        playBeep(220, 0.5);
        return;
      }

      if (crashA) {
        isFinished = true;
        setIsLiveDuelActive(false);
        setLiveDuelFinished(true);
        setLiveDuelWinner(duelCompetitorB.name);
        clearInterval(liveDuelTimerRef.current);

        const crashLog = `💥 COLISÃO/DNF DE ${duelCompetitorA.name.toUpperCase()} NA VOLTA ${currentLap}! O piloto ${pickStory()} e encostou no muro! ${duelCompetitorB.name} herda a liderança absoluta e vence!`;
        setLiveDuelLogs(prev => [crashLog, ...prev]);

        setLiveStatsA({ speed: 0, throttle: 0, brake: 0, temp: tempA, score: scoreA, status: '💥 DNF' });
        setLiveStatsB({ speed: actSpeedB, throttle: 60, brake: 0, temp: tempB, score: scoreB, status: '🏆 VENCEDOR' });
        playBeep(260, 0.4);
        return;
      }

      if (crashB) {
        isFinished = true;
        setIsLiveDuelActive(false);
        setLiveDuelFinished(true);
        setLiveDuelWinner(duelCompetitorA.name);
        clearInterval(liveDuelTimerRef.current);

        const crashLog = `💥 COLISÃO/DNF DE ${duelCompetitorB.name.toUpperCase()} NA VOLTA ${currentLap}! O competidor ciano de equipe ${pickStory()}! ${duelCompetitorA.name} assume a liderança e vence com facilidade!`;
        setLiveDuelLogs(prev => [crashLog, ...prev]);

        setLiveStatsA({ speed: actSpeedA, throttle: 60, brake: 0, temp: tempA, score: scoreA, status: '🏆 VENCEDOR' });
        setLiveStatsB({ speed: 0, throttle: 0, brake: 0, temp: tempB, score: scoreB, status: '💥 DNF' });
        playBeep(260, 0.4);
        return;
      }

      // Live Telemetry attributes fluctuation
      let throtA = sector === 'Reta' ? 100 : sector === 'Curva' ? 45 : 75;
      let throtB = sector === 'Reta' ? 100 : sector === 'Curva' ? 40 : 70;
      let brkA = sector === 'Curva' ? 65 : 0;
      let brkB = sector === 'Curva' ? 70 : 0;

      setLiveStatsA({ speed: actSpeedA, throttle: throtA, brake: brkA, temp: tempA, score: scoreA, status: 'ATIVO' });
      setLiveStatsB({ speed: actSpeedB, throttle: throtB, brake: brkB, temp: tempB, score: scoreB, status: 'ATIVO' });

      // Storyteller dynamic comments
      let logTxt = '';
      const gapSec = (Math.abs(scoreA - scoreB) / 100).toFixed(3);
      const isLeadA = scoreA > scoreB;

      if (sector === 'Chuva') {
        logTxt = `🌧️ [VOLTA ${currentLap} - CHUVA] Chuva torrencial desafia as frenagens! ${isLeadA ? duelCompetitorA.name : duelCompetitorB.name} se mostra mais consistente e abre uma margem de ${gapSec}s.`;
      } else if (sector === 'Curva') {
        logTxt = `📐 [VOLTA ${currentLap} - SETOR CHICANE] Freadas tardias! Os pneus de competição aquecem ferozmente no limite físico. G-Force de tirar o fôlego!`;
      } else if (sector === 'Reta') {
        logTxt = `🏎️ [VOLTA ${currentLap} - RETA PRINCIPAL] Pé embaixo! ${isLeadA ? duelCompetitorA.name : duelCompetitorB.name} despeja potência máxima a mais de 330km/h com vantagem de ${gapSec}s.`;
      } else if (sector === 'S') {
        logTxt = `🔄 [VOLTA ${currentLap} - S VELOZ] Oscilação brusca de aceleração e embreagem! Ambas as máquinas contornando os ápices de tangência lado a lado.`;
      } else {
        logTxt = `⚡ [VOLTA ${currentLap} - SETOR MISTO] Batalha intensa por cada milésimo de segundo! Os sensores indicam que o duelo está extraordinariamente nivelado.`;
      }

      setLiveDuelLogs(prev => [logTxt, ...prev]);
      playBeep(600 + (isLeadA ? 120 : -100), 0.05);

    }, 850);
  };



  // Simulation states
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simActiveRaceIdx, setSimActiveRaceIdx] = useState<number>(-1);
  const [simLightsCount, setSimLightsCount] = useState<number>(0);
  const [simRaceCompleted, setSimRaceCompleted] = useState<boolean>(false);

  // Session History (Session storage based)
  const [recentSessions, setRecentSessions] = useState<SavedSession[]>([]);

  // Sound cue simulation state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [expandedGps, setExpandedGps] = useState<Record<number, boolean>>({});

  // Load history on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('f1_draft_history');
      if (stored) {
        setRecentSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Simple toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sound pitch cue
  const playBeep = (freq: number, dur: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  };

  // Start new draft session
  const handleStartGame = (mode: 'normal' | 'hard' | 'underdog') => {
    setDifficultyMode(mode);
    setSlots({});
    setActiveSlotIndex(0);
    setJokerAvailable(true);
    setGameMode('draft');
    
    // Draw first combination
    const rolled = getRandomComboExcept([], mode === 'underdog');
    setActiveCombo(rolled);
    generateCandidatesForSlot(GAME_SLOTS[0], rolled, {});
    playBeep(440, 0.1);
  };

  // Draw Candidates based on Slot and Rolled Team Matchup
  const generateCandidatesForSlot = (
    currentSlot: GameSlot,
    combo: TeamCombination,
    currentSlots: Record<string, any>
  ) => {
    if (!combo) return;

    if (currentSlot.type === 'driver') {
      // Get drivers from team
      const teamDrivers = combo.drivers.map(d => ({
        ...d,
        entityType: 'driver',
        sourceTeam: combo.teamName,
        sourceSeason: combo.season,
      }));

      // Filter drivers that are already drafted to prevent duplicates
      const draftedNames = Object.values(currentSlots).map(item => item && item.name).filter(Boolean);
      let filteredDrivers = teamDrivers.filter(d => !draftedNames.includes(d.name));

      // If we are looking for a rain specialist, let's inject historical wet weather masters as choices
      if (currentSlot.id === 'wet_specialist') {
        const wetMasters = [
          {
            id: 'senna_wet_legend',
            name: 'Ayrton Senna (Mestre da Chuva)',
            country: 'Brasil 🇧🇷',
            titles: 3,
            wins: 41,
            podiums: 80,
            poles: 65,
            rating_geral: 99,
            pace: 100,
            consistency: 95,
            chuva: 100,
            aggressiveness: 98,
            reliability: 94,
            description: 'Lenda absoluta sob as tempestades mais terríveis da história da F1.',
            entityType: 'driver',
            sourceTeam: 'McLaren',
            sourceSeason: 1988,
          },
          {
            id: 'schumacher_wet_legend',
            name: 'Michael Schumacher (Kaiser sob Chuva)',
            country: 'Alemanha 🇩🇪',
            titles: 7,
            wins: 91,
            podiums: 155,
            poles: 68,
            rating_geral: 98,
            pace: 99,
            consistency: 99,
            chuva: 99,
            aggressiveness: 92,
            reliability: 99,
            description: 'Seu controle tático em pistas úmidas era simplesmente de outro planeta.',
            entityType: 'driver',
            sourceTeam: 'Ferrari',
            sourceSeason: 2004,
          },
          {
            id: 'button_wet_legend',
            name: 'Jenson Button (Especialista em Misto)',
            country: 'Reino Unido 🇬🇧',
            titles: 1,
            wins: 15,
            podiums: 50,
            poles: 8,
            rating_geral: 93,
            pace: 91,
            consistency: 96,
            chuva: 98,
            aggressiveness: 80,
            reliability: 95,
            description: 'Mestre incontestável em ler o momento de transição de asfalto úmido para seco.',
            entityType: 'driver',
            sourceTeam: 'Brawn GP',
            sourceSeason: 2009,
          },
          {
            id: 'barrichello_wet_legend',
            name: 'Rubens Barrichello (Mestre de Interlagos)',
            country: 'Brasil 🇧🇷',
            titles: 0,
            wins: 11,
            podiums: 68,
            poles: 14,
            rating_geral: 91,
            pace: 89,
            consistency: 91,
            chuva: 95,
            aggressiveness: 82,
            reliability: 94,
            description: 'Tem uma sensibilidade mágica com as poças na chuva de Interlagos e Silverstone.',
            entityType: 'driver',
            sourceTeam: 'Ferrari',
            sourceSeason: 2004,
          }
        ];
        
        // Add valid ones who aren't already drafted
        const validWetMasters = wetMasters.filter(m => !draftedNames.includes(m.name));
        filteredDrivers = [...filteredDrivers, ...validWetMasters];
      }

      // If we are looking for a legacy wildcard, add generic legends or other historical options
      if (currentSlot.id === 'legacy_wildcard') {
        const legends = [
          {
            id: 'prost_legacy',
            name: 'Alain Prost (O Professor)',
            country: 'França 🇫🇷',
            titles: 4,
            wins: 51,
            podiums: 106,
            poles: 33,
            rating_geral: 97,
            pace: 96,
            consistency: 100,
            chuva: 88,
            aggressiveness: 78,
            reliability: 98,
            description: 'Frio, cirúrgico e taticamente perfeito em economizar pneus e motor.',
            entityType: 'driver',
            sourceTeam: 'McLaren',
            sourceSeason: 1989,
          },
          {
            id: 'vettel_legacy',
            name: 'Sebastian Vettel (Tetracampeão)',
            country: 'Alemanha 🇩🇪',
            titles: 4,
            wins: 53,
            podiums: 122,
            poles: 57,
            rating_geral: 95,
            pace: 95,
            consistency: 94,
            chuva: 90,
            aggressiveness: 86,
            reliability: 95,
            description: 'O jovem prodígio absoluto das poles e do domínio de ponta a ponta na era Red Bull.',
            entityType: 'driver',
            sourceTeam: 'Red Bull Racing',
            sourceSeason: 2013,
          },
          {
            id: 'alonso_legacy',
            name: 'Fernando Alonso (El Nano)',
            country: 'Espanha 🇪🇸',
            titles: 2,
            wins: 32,
            podiums: 106,
            poles: 22,
            rating_geral: 96,
            pace: 96,
            consistency: 97,
            chuva: 92,
            aggressiveness: 92,
            reliability: 96,
            description: 'Combatividade incansável, defesas de pista históricas e agressividade letal.',
            entityType: 'driver',
            sourceTeam: 'Renault F1',
            sourceSeason: 2005,
          }
        ];
        
        const validLegends = legends.filter(l => !draftedNames.includes(l.name));
        filteredDrivers = [...filteredDrivers, ...validLegends];
      }

      // Just in case both are already taken, inject some classic generic/extra legendary drivers
      if (filteredDrivers.length === 0) {
        filteredDrivers.push({
          id: 'hamilton_classic',
          name: 'Lewis Hamilton (Clássico)',
          country: 'Reino Unido 🇬🇧',
          titles: 7,
          wins: 103,
          podiums: 195,
          poles: 104,
          rating_geral: 95,
          pace: 96,
          consistency: 94,
          chuva: 97,
          aggressiveness: 88,
          reliability: 96,
          description: 'Inserido como piloto lendário coringa disponível do paddock.',
          entityType: 'driver',
          sourceTeam: combo.teamName,
          sourceSeason: combo.season,
        } as any);
      }
      setCandidates(filteredDrivers);

    } else if (currentSlot.type === 'boss') {
      // Official boss
      const candidatesList = [
        {
          ...combo.boss,
          entityType: 'boss',
          sourceTeam: combo.teamName,
          sourceSeason: combo.season,
        }
      ];

      // Add a sibling alternative from our database for choice variety
      const otherCombos = SEASONS_TEAMS.filter(t => t.teamId !== combo.teamId);
      if (otherCombos.length > 0) {
        const randomOther = otherCombos[Math.floor(Math.random() * otherCombos.length)];
        candidatesList.push({
          ...randomOther.boss,
          entityType: 'boss',
          sourceTeam: randomOther.teamName,
          sourceSeason: randomOther.season,
        });
      }
      setCandidates(candidatesList);

    } else if (currentSlot.type === 'chassis') {
      const candidatesList = [
        {
          ...combo.chassis,
          entityType: 'chassis',
          sourceTeam: combo.teamName,
          sourceSeason: combo.season,
        }
      ];
      // Alt chassis
      const otherCombos = SEASONS_TEAMS.filter(t => t.teamId !== combo.teamId);
      if (otherCombos.length > 0) {
        const randomOther = otherCombos[Math.floor(Math.random() * otherCombos.length)];
        candidatesList.push({
          ...randomOther.chassis,
          entityType: 'chassis',
          sourceTeam: randomOther.teamName,
          sourceSeason: randomOther.season,
        });
      }
      setCandidates(candidatesList);

    } else if (currentSlot.type === 'strategist') {
      const candidatesList = [
        {
          ...combo.strategist,
          entityType: 'strategist',
          sourceTeam: combo.teamName,
          sourceSeason: combo.season,
        }
      ];
      // Alt strategist
      const otherCombos = SEASONS_TEAMS.filter(t => t.teamId !== combo.teamId);
      if (otherCombos.length > 0) {
        const randomOther = otherCombos[Math.floor(Math.random() * otherCombos.length)];
        candidatesList.push({
          ...randomOther.strategist,
          entityType: 'strategist',
          sourceTeam: randomOther.teamName,
          sourceSeason: randomOther.season,
        });
      }
      setCandidates(candidatesList);

    } else if (currentSlot.type === 'engineer') {
      const candidatesList = [
        {
          ...combo.engineer,
          entityType: 'engineer',
          sourceTeam: combo.teamName,
          sourceSeason: combo.season,
        }
      ];
      // Alt engineer
      const otherCombos = SEASONS_TEAMS.filter(t => t.teamId !== combo.teamId);
      if (otherCombos.length > 0) {
        const randomOther = otherCombos[Math.floor(Math.random() * otherCombos.length)];
        candidatesList.push({
          ...randomOther.engineer,
          entityType: 'engineer',
          sourceTeam: randomOther.teamName,
          sourceSeason: randomOther.season,
        });
      }
      setCandidates(candidatesList);
    }
  };

  // Handle Reroll with Coringa
  const handleUseJoker = () => {
    if (!jokerAvailable) return;
    setJokerAvailable(false);
    
    // Pick another random team
    const rolled = getRandomComboExcept(activeCombo ? [activeCombo.teamId] : [], difficultyMode === 'underdog');
    setActiveCombo(rolled);
    generateCandidatesForSlot(GAME_SLOTS[activeSlotIndex], rolled, slots);
    
    playBeep(650, 0.15);
    triggerToast('🎲 Coringa ativado! Uma nova escuderia e era histórica foram sorteadas.');
  };

  // Handle manual selection of slot index in sidebar to edit or recruit it
  const handleSelectSlotIndex = (idx: number) => {
    setActiveSlotIndex(idx);
    const rolled = activeCombo || getRandomComboExcept([], difficultyMode === 'underdog');
    setActiveCombo(rolled);
    generateCandidatesForSlot(GAME_SLOTS[idx], rolled, slots);
    playBeep(440, 0.05);
  };

  // Handle Draft Selection
  const handleSelectCandidate = (item: any) => {
    const activeSlot = GAME_SLOTS[activeSlotIndex];
    const newSlots = { ...slots, [activeSlot.id]: item };
    setSlots(newSlots);

    // Dynamic click feedback
    playBeep(880, 0.08);

    // Verify if there are any remaining unfilled slots
    const unfilledSlots = GAME_SLOTS.filter(s => !newSlots[s.id]);

    if (unfilledSlots.length > 0) {
      // Check if we can progress sequentially or jump to the first empty slot
      let nextIndex = activeSlotIndex + 1;
      if (nextIndex >= GAME_SLOTS.length || newSlots[GAME_SLOTS[nextIndex].id]) {
        const firstEmptyIdx = GAME_SLOTS.findIndex(s => !newSlots[s.id]);
        if (firstEmptyIdx !== -1) {
          nextIndex = firstEmptyIdx;
        }
      }

      if (nextIndex < GAME_SLOTS.length) {
        setActiveSlotIndex(nextIndex);
        // Roll next Season+Team combination
        const rolled = getRandomComboExcept([], difficultyMode === 'underdog');
        setActiveCombo(rolled);
        generateCandidatesForSlot(GAME_SLOTS[nextIndex], rolled, newSlots);
      } else {
        triggerSimulation(newSlots);
      }
    } else {
      // Draft Complete! Let's trigger simulate
      triggerSimulation(newSlots);
    }
  };

  // Start Simulation Flow
  const triggerSimulation = (finalSlots: Record<string, any>) => {
    setGameMode('simulating');
    setSimActiveRaceIdx(-1);
    setSimLightsCount(0);
    setSimRaceCompleted(false);

    // Pick 3 random support cards
    const shuffled = [...BUFF_CARDS].sort(() => 0.5 - Math.random());
    setAvailableCards(shuffled.slice(0, 3));
    setBuffHistory([]);

    // Compile result
    const results = runChampionshipSimulation(finalSlots, difficultyMode);
    setSimulationResult(results);

    // Initial countdown simulation lights
    let lightTimer = 0;
    const interval = setInterval(() => {
      lightTimer += 1;
      setSimLightsCount(lightTimer);
      playBeep(520, 0.1);

      if (lightTimer === 5) {
        clearInterval(interval);
        setTimeout(() => {
          // Turn off lights beep (Classic F1 starting beep)
          setSimLightsCount(6);
          playBeep(1000, 0.45);
          
          // Start step-by-step race simulations
          runStepByStepGPs();
        }, 1200);
      }
    }, 700);
  };

  // Step key race events with custom timer
  const runStepByStepGPs = () => {
    let activeRace = 0;
    const interval = setInterval(() => {
      setSimActiveRaceIdx(activeRace);
      playBeep(587, 0.1);

      activeRace += 1;
      if (activeRace >= CIRCUITS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setSimRaceCompleted(true);
        }, 800);
      }
    }, 1800); // 1.8 seconds per grand prix to view
  };

  // Recalculate standings on-the-fly when support/buff cards are applied
  const recalculateStandingsFromRaces = (raceResults: any[]) => {
    const pointsList = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const driverStandingsMap: Record<string, { points: number; wins: number; podiums: number; dnfCount: number; team: string; color: string; isUser: boolean }> = {};
    const teamStandingsMap: Record<string, number> = {};

    // Get all initial drivers and teams from the first race to initialize the maps
    if (raceResults.length > 0) {
      raceResults[0].positions.forEach((p: any) => {
        driverStandingsMap[p.driver] = {
          points: 0,
          wins: 0,
          podiums: 0,
          dnfCount: 0,
          team: p.team,
          color: p.color,
          isUser: p.team === 'Seu Time',
        };
        teamStandingsMap[p.team] = 0;
      });
    }

    // Tally points across results
    raceResults.forEach((raceRes) => {
      raceRes.positions.forEach((p: any, idx: number) => {
        const entry = driverStandingsMap[p.driver];
        if (entry) {
          if (p.dnf) {
            entry.dnfCount += 1;
            // No points scored
            p.points = 0;
          } else {
            const pts = idx < 10 ? pointsList[idx] : 0;
            p.points = pts; // persist
            entry.points += pts;
            teamStandingsMap[p.team] = (teamStandingsMap[p.team] || 0) + pts;
            
            if (idx === 0) entry.wins += 1;
            if (idx < 3) entry.podiums += 1;
          }
        }
      });
    });

    const driverStandings = Object.keys(driverStandingsMap).map(drvName => ({
      driver: drvName,
      ...driverStandingsMap[drvName],
    })).sort((a, b) => b.points - a.points);

    const teamStandings = Object.keys(teamStandingsMap).map(tName => {
      const isU = tName === 'Seu Time';
      const firstDrv = driverStandings.find(d => d.team === tName);
      return {
        team: tName,
        points: teamStandingsMap[tName],
        isUser: isU,
        color: isU ? '#FF3E3E' : (firstDrv?.color || '#94A3B8'),
      };
    }).sort((a, b) => b.points - a.points);

    return { driverStandings, teamStandings };
  };

  // Perform card buff activation
  const handleApplyCard = (cardId: string) => {
    if (!simulationResult || simActiveRaceIdx < 0) {
      triggerToast('⚠️ Aguarde a largada ou selecione uma corrida ativa para aplicar o buff!');
      return;
    }

    const currentGPEntity = CIRCUITS[simActiveRaceIdx];
    if (!currentGPEntity) return;

    // Deep clone simulationResult to avoid mutation errors
    const cloned = JSON.parse(JSON.stringify(simulationResult));
    const raceRes = cloned.raceResults[simActiveRaceIdx];
    if (!raceRes) return;

    let hasApplied = false;
    let logMsg = '';

    const userDriverEntries = raceRes.positions.filter((p: any) => p.team === 'Seu Time');
    if (userDriverEntries.length === 0) {
      triggerToast('⚠️ Nenhum piloto do seu time encontrado nesta corrida!');
      return;
    }

    // Isolate competitor drivers
    const others = raceRes.positions.filter((p: any) => p.team !== 'Seu Time');

    if (cardId === 'drs') {
      userDriverEntries.forEach((u: any) => {
        u.dnf = false;
        delete u.incident;
        u.trackEffect = '🚀 DRS Infinito Ativado (P1/P2)';
      });
      raceRes.positions = [...userDriverEntries, ...others];
      logMsg = `🚀 DRS Infinito: Dobradinha em P1 e P2 no ${currentGPEntity.name}!`;
      hasApplied = true;

    } else if (cardId === 'party_mode') {
      const d1Name = slots['driver_1']?.name || 'Seu Piloto 1';
      const d1Entry = raceRes.positions.find((p: any) => p.driver === d1Name);
      if (d1Entry) {
        d1Entry.dnf = false;
        delete d1Entry.incident;
        d1Entry.trackEffect = '🔥 Modo Festa no Motor (P1)';
        const index = raceRes.positions.indexOf(d1Entry);
        if (index !== -1) {
          raceRes.positions.splice(index, 1);
        }
        raceRes.positions.unshift(d1Entry);
        logMsg = `🔥 Modo Festa: ${d1Name} assume a P1 absoluta no ${currentGPEntity.name}!`;
        hasApplied = true;
      } else {
        triggerToast('⚠️ Piloto Principal 1 não ativo nesta corrida.');
      }

    } else if (cardId === 'shield') {
      let dnfRemoved = false;
      userDriverEntries.forEach((u: any) => {
        if (u.dnf) {
          u.dnf = false;
          delete u.incident;
          u.trackEffect = '🛡️ Mureta Blindada: Desastre Evitado';
          dnfRemoved = true;
        }
      });
      
      if (dnfRemoved) {
        // Find normal drivers and locate user drivers back in safe scoring zones (P5, P6)
        const rest = raceRes.positions.filter((p: any) => p.team !== 'Seu Time' || !p.dnf);
        raceRes.positions = [
          ...rest.slice(0, 4),
          ...userDriverEntries,
          ...rest.slice(4)
        ];
        logMsg = `🛡️ Mureta Blindada: Danos reparados. Retomamos para as posições de pontuação!`;
      } else {
        // General rating boost
        userDriverEntries.forEach((u: any) => {
          u.trackEffect = '🛡️ Chassi Reforçado (+4 posições)';
        });
        raceRes.positions = [...userDriverEntries, ...others];
        logMsg = `🛡️ Mureta Blindada: Escuderia blindada voando baixo no asfalto.`;
      }
      hasApplied = true;

    } else if (cardId === 'stop_iceman') {
      // Double podium
      userDriverEntries.forEach((u: any, uIdx: number) => {
        u.dnf = false;
        delete u.incident;
        u.trackEffect = `🍦 Pit Stop Perfeito (${1.7 + uIdx * 0.1}s)`;
      });
      raceRes.positions = [...userDriverEntries, ...others];
      logMsg = `🍦 Strategic Iceman: Pódio duplo com pitstop de elite no ${currentGPEntity.name}!`;
      hasApplied = true;

    } else if (cardId === 'forced_rain') {
      userDriverEntries.forEach((u: any) => {
        u.dnf = false;
        delete u.incident;
        u.trackEffect = '🌧️ Especialista de Chuva Ativo';
      });
      // Place in P1 and P2
      raceRes.positions = [...userDriverEntries, ...others];
      logMsg = `🌧️ Dança da Chuva: Temporal evocado estrategicamente! Dobrada no topo do asfalto molhado!`;
      hasApplied = true;

    } else if (cardId === 'multi21') {
      const d2Name = slots['driver_2']?.name || 'Seu Piloto 2';
      const d2Entry = raceRes.positions.find((p: any) => p.driver === d2Name);
      if (d2Entry) {
        d2Entry.dnf = false;
        delete d2Entry.incident;
        d2Entry.trackEffect = '🏆 Ordem de Mureta Multi-31 (P1)';
        const index = raceRes.positions.indexOf(d2Entry);
        if (index !== -1) {
          raceRes.positions.splice(index, 1);
        }
        raceRes.positions.unshift(d2Entry);
        logMsg = `📻 Multi-31 Reversa: Piloto Principal 2 ultrapassa na marra e fatura a vitória!`;
        hasApplied = true;
      } else {
        triggerToast('⚠️ Piloto 2 não ativo nesta corrida.');
      }
    }

    if (hasApplied) {
      // Refresh podium field with proper object format expected by the app
      raceRes.podium = raceRes.positions.slice(0, 3).map((p: any) => ({
        driver: p.driver,
        team: p.team,
        color: p.color || '#94A3B8'
      }));

      // Recalculate whole standings
      const recalculated = recalculateStandingsFromRaces(cloned.raceResults);
      cloned.driverStandings = recalculated.driverStandings;
      cloned.teamStandings = recalculated.teamStandings;

      // Update narration feed
      cloned.narrationHighlights.unshift(`⚡ [BUSTER] ${logMsg}`);

      // Save!
      setSimulationResult(cloned);
      setAvailableCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCardToUse(null);
      setActiveBuffModals(false);
      setBuffHistory(prev => [logMsg, ...prev]);

      playBeep(987, 0.45);
      triggerToast('🎉 Card de Buff ativado com sucesso para este GP!');
    }
  };

  // Finished viewing simulation -> show result
  const handleShowFinalResults = () => {
    if (!simulationResult) return;

    // Calculate overall statistics
    const ratingsArray = [
      slots['driver_1']?.rating_geral || 80,
      slots['driver_2']?.rating_geral || 80,
      slots['reserve_1']?.rating_geral || 80,
      slots['reserve_2']?.rating_geral || 80,
      slots['wet_specialist']?.rating_geral || 80,
      slots['legacy_wildcard']?.rating_geral || 80,
      slots['team_boss']?.rating_geral || 80,
      slots['chassis']?.rating_geral || 80,
      slots['strategist']?.rating_geral || 80,
      slots['engineer']?.rating_geral || 80,
    ];
    const avgRating = Math.round(ratingsArray.reduce((src, val) => src + val, 0) / 10);
    const rankObj = evaluateQualityRank(avgRating);

    const userBest = simulationResult.driverStandings.find((d: any) => d.isUser);

    // Save to local session history
    const runSummary: SavedSession = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      seed: Math.floor(Math.random() * 9999 + 1000).toString(),
      overallRating: avgRating,
      rank: rankObj,
      champion: userBest?.driver || 'Nenhum',
      points: userBest?.points || 0
    };

    const updated = [runSummary, ...recentSessions].slice(0, 10);
    setRecentSessions(updated);
    try {
      sessionStorage.setItem('f1_draft_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setGameMode('results');
    playBeep(659, 0.3);
  };

  // Share text builder
  const handleCopyShareText = () => {
    try {
      const userBest = simulationResult.driverStandings.find((d: any) => d.isUser);
      const isWinner = simulationResult.driverStandings[0]?.isUser;
      const teamRanking = simulationResult.teamStandings.findIndex((t: any) => t.isUser) + 1;

      const ratingsArray = [
        slots['driver_1']?.rating_geral || 80,
        slots['driver_2']?.rating_geral || 80,
        slots['reserve_1']?.rating_geral || 80,
        slots['reserve_2']?.rating_geral || 80,
        slots['wet_specialist']?.rating_geral || 80,
        slots['legacy_wildcard']?.rating_geral || 80,
        slots['team_boss']?.rating_geral || 80,
        slots['chassis']?.rating_geral || 80,
        slots['strategist']?.rating_geral || 80,
        slots['engineer']?.rating_geral || 80,
      ];
      const avgRating = Math.round(ratingsArray.reduce((src, val) => src + val, 0) / 10);
      const rankObj = evaluateQualityRank(avgRating);

      const activeCombosObj = detectCombos(slots);

      const text = `🏎️ MINHA ESCUDERIA NO 7a0 FORMULA 1!

🏆 Melhor Piloto: ${userBest?.driver} (Acabou em P${simulationResult.driverStandings.findIndex((d: any) => d.isUser) + 1})
🛠️ Equipe Geral: Rating ${avgRating}/100 [Escala ${rankObj.rank.toUpperCase()}]
🏁 Mundial de Construtores: P${teamRanking} no Campeonato Geral

Composição do meu Dream Team:
• Principal 1: ${slots['driver_1']?.name || 'N/A'}
• Principal 2: ${slots['driver_2']?.name || 'N/A'}
• Carro / Chassi: ${slots['chassis']?.name || 'N/A'}
• Engenheiro: ${slots['engineer']?.name || 'N/A'}
• Chefe: ${slots['team_boss']?.name || 'N/A'}

Combos Ativados: ${activeCombosObj.length > 0 ? activeCombosObj.map(c => c.name).join(' | ') : 'Nenhum'}

Jogue agora em: ${window.location.href}`;

      navigator.clipboard.writeText(text);
      triggerToast('📋 Resultado copiado para a área de transferência! Compartilhe com amigos.');
    } catch (_) {
      triggerToast('⚠️ Falha ao copiar. Selecione manualmente o texto.');
    }
  };

  // Season point accumulation data for Recharts
  const seasonProgressionData = React.useMemo(() => {
    if (!simulationResult || !simulationResult.raceResults) return [];

    const championTeamEntry = simulationResult.teamStandings[0];
    const rivalTeamEntry = championTeamEntry?.team === 'Seu Time'
      ? simulationResult.teamStandings[1]
      : championTeamEntry;

    const rivalTeamName = rivalTeamEntry?.team || 'Rival';
    const rivalColor = rivalTeamEntry?.color || '#1E40AF';

    let userCumulative = 0;
    let rivalCumulative = 0;

    return simulationResult.raceResults.map((raceResult: any, idx: number) => {
      const userRacePoints = raceResult.positions
        .filter((p: any) => p.team === 'Seu Time')
        .reduce((sum: number, p: any) => sum + p.points, 0);

      const rivalRacePoints = raceResult.positions
        .filter((p: any) => p.team === rivalTeamName)
        .reduce((sum: number, p: any) => sum + p.points, 0);

      userCumulative += userRacePoints;
      rivalCumulative += rivalRacePoints;

      const shortGpName = raceResult.raceName
        ? raceResult.raceName
            .replace('Grande Prêmio do ', 'GP ')
            .replace('Grande Prêmio da ', 'GP ')
            .replace('Grande Prêmio de ', 'GP ')
            .replace('Grande Prêmio ', 'GP ')
        : `Etapa ${idx + 1}`;

      return {
        stage: idx + 1,
        name: shortGpName,
        'Seu Time': userCumulative,
        [rivalTeamName]: rivalCumulative,
        rivalTeamName,
        rivalColor,
      };
    });
  }, [simulationResult]);

  // Average Rating
  const activeAvgRating = () => {
    const keys = Object.keys(slots);
    if (keys.length === 0) return 0;
    const sum = keys.reduce((acc, k) => acc + (slots[k]?.rating_geral || 80), 0);
    return Math.round(sum / keys.length);
  };

  // Generate smart paddock tips based on current drafting choices
  const getPaddockTips = () => {
    const tips: {
      id: string;
      title: string;
      description: string;
      priority: 'alta' | 'média' | 'baixa' | 'aviso';
      targetSlotId?: string;
      icon: 'sparkles' | 'zap' | 'brain' | 'wind' | 'heart' | 'alert' | 'info';
    }[] = [];

    // Helper to check if any slot matching driver roles is empty
    const anyDriverSlotEmpty = GAME_SLOTS.some(s => s.id.includes('driver') || s.id.includes('reserve') || s.id === 'wet_specialist' || s.id === 'legacy_wildcard') && 
      !GAME_SLOTS.filter(s => s.id.includes('driver') || s.id.includes('reserve') || s.id === 'wet_specialist' || s.id === 'legacy_wildcard').every(s => slots[s.id]);

    const isSlotEmpty = (id: string) => !slots[id];

    // Read current team items
    const drivers = [
      slots['driver_1'],
      slots['driver_2'],
      slots['reserve_1'],
      slots['reserve_2'],
      slots['wet_specialist'],
      slots['legacy_wildcard']
    ].filter(Boolean);

    const hasSenna = drivers.some(d => d.name?.toLowerCase().includes('senna'));
    const hasSchumacher = drivers.some(d => d.name?.toLowerCase().includes('schumacher'));
    const hasHamilton = drivers.some(d => d.name?.toLowerCase().includes('hamilton'));

    const hasMcLaren = slots['chassis']?.name?.toLowerCase().includes('mclaren');
    const hasFerrari = slots['chassis']?.name?.toLowerCase().includes('ferrari');
    const hasMercedes = slots['chassis']?.name?.toLowerCase().includes('mercedes');
    const hasRedBull = slots['chassis']?.name?.toLowerCase().includes('red bull');
    const hasWilliams = slots['chassis']?.name?.toLowerCase().includes('williams');

    const hasTodt = slots['team_boss']?.name?.toLowerCase().includes('todt');
    const hasHorner = slots['team_boss']?.name?.toLowerCase().includes('horner');
    const hasBinotto = slots['team_boss']?.name?.toLowerCase().includes('binotto');

    const hasNewey = slots['engineer']?.name?.toLowerCase().includes('newey');
    const hasHannah = slots['strategist']?.name?.toLowerCase().includes('hannah');
    const hasRueda = slots['strategist']?.name?.toLowerCase().includes('inaki');

    // 1. Senna & McLaren
    if (hasSenna && isSlotEmpty('chassis')) {
      tips.push({
        id: 'senna_mclaren_chassis',
        title: 'Foco no Chassi McLaren 🏎️',
        description: 'Você já recrutou Ayrton Senna! Garanta o Chassi McLaren quando surgir para fechar a famosa simbiose histórica (+5 Ritmo, +3 Confiabilidade).',
        priority: 'alta',
        targetSlotId: 'chassis',
        icon: 'sparkles'
      });
    } else if (hasMcLaren && anyDriverSlotEmpty) {
      tips.push({
        id: 'senna_mclaren_driver',
        title: 'À procura do Rei da Chuva 👑',
        description: 'Com o chassi McLaren já escalado, fique de olho em Ayrton Senna para reviver a icônica dinastia vermelha e branca.',
        priority: 'alta',
        icon: 'sparkles'
      });
    }

    // 2. Schumacher & Ferrari or Todt
    if (hasSchumacher) {
      if (isSlotEmpty('chassis') && !hasFerrari) {
        tips.push({
          id: 'kaiser_ferrari_chassis',
          title: 'Parceria Ferrarista Crítica 🇮🇹',
          description: 'A lenda Michael Schumacher está a bordo! Procure pelo Chassi Ferrari para ativar o imbatível bônus de consistência.',
          priority: 'alta',
          targetSlotId: 'chassis',
          icon: 'zap'
        });
      }
      if (isSlotEmpty('team_boss') && !hasTodt) {
        tips.push({
          id: 'kaiser_todt_boss',
          title: 'Recrute Jean Todt 📋',
          description: 'Reúna o Kaiser com Jean Todt no Chefe do Time para habilitar o lendário combo "Era de Ouro Maranello".',
          priority: 'alta',
          targetSlotId: 'team_boss',
          icon: 'brain'
        });
      }
    } else {
      if ((hasFerrari || hasTodt) && anyDriverSlotEmpty) {
        tips.push({
          id: 'ferrari_schumacher',
          title: 'Em busca do Schumacher! 🇩🇪',
          description: 'Você já possui bases de Maranello (Chassi ou Chefe). Garanta Michael Schumacher nos slots de piloto para criar a Era de Ouro.',
          priority: 'média',
          icon: 'zap'
        });
      }
    }

    // 3. Newey + Red Bull / Williams
    if (hasNewey && isSlotEmpty('chassis')) {
      tips.push({
        id: 'newey_chassis',
        title: 'Alvo: Williams ou Red Bull 📊',
        description: 'Adrian Newey está na Engenharia! Busque no draft de Chassi uma Williams ou Red Bull para habilitar o combo "Gênio Aerodinâmico" (+8 Aero).',
        priority: 'alta',
        targetSlotId: 'chassis',
        icon: 'wind'
      });
    } else if ((hasRedBull || hasWilliams) && isSlotEmpty('engineer')) {
      tips.push({
        id: 'newey_engineer',
        title: 'Alvo: Adrian Newey 🔧',
        description: 'Seu carro tem chassi Williams/Red Bull. Contrate Adrian Newey no Engenheiro caso ele apareça para ativar as linhas aerodinâmicas perfeitas.',
        priority: 'alta',
        targetSlotId: 'engineer',
        icon: 'wind'
      });
    }

    // 4. Hamilton + Mercedes
    if (hasHamilton && isSlotEmpty('chassis')) {
      tips.push({
        id: 'ham_chassis',
        title: 'Alvo: Chassi Mercedes ⭐',
        description: 'Lewis Hamilton de piloto principal! Use o Chassi Mercedes para disparar o "Sexteto Prateado" (+5 Pace).',
        priority: 'alta',
        targetSlotId: 'chassis',
        icon: 'zap'
      });
    } else if (hasMercedes && anyDriverSlotEmpty) {
      tips.push({
        id: 'mercedes_hamilton',
        title: 'De Olho em Lewis Hamilton!',
        description: 'Você garantiu as flechas de prata da Mercedes. Recrutar Lewis Hamilton ativará o ritmo devastador do "Hammer Time".',
        priority: 'média',
        icon: 'zap'
      });
    }

    // 5. Hannah Schmitz + Red Bull/Horner
    if (hasHannah) {
      if (isSlotEmpty('chassis') && !hasRedBull) {
        tips.push({
          id: 'hannah_redbull_chassis',
          title: 'Sinergia Red Bull Racing 🐂',
          description: 'Hannah Schmitz está traçando as paradas de box! Combine com Chassi Red Bull para atingir o bônus "Estratégia Imparável".',
          priority: 'alta',
          targetSlotId: 'chassis',
          icon: 'brain'
        });
      }
      if (isSlotEmpty('team_boss') && !hasHorner) {
        tips.push({
          id: 'hannah_horner_boss',
          title: 'Sinergia com Christian Horner 📋',
          description: 'Combine Hannah com Christian Horner como Chefe da Equipe para obter a melhor sinergia de pit-lane tático.',
          priority: 'média',
          targetSlotId: 'team_boss',
          icon: 'brain'
        });
      }
    } else if ((hasRedBull || hasHorner) && isSlotEmpty('strategist')) {
      tips.push({
        id: 'redbull_hannah',
        title: 'Contrate Hannah Schmitz 🧠',
        description: 'Com chassi ou chefia da Red Bull garantidos, priorize Hannah Schmitz para o cargo de Estrategista para ditar paradas perfeitas.',
        priority: 'alta',
        targetSlotId: 'strategist',
        icon: 'brain'
      });
    }

    // 6. Garra Brasileira
    const brCount = drivers.filter(d => d.country?.includes('Brasil')).length;
    if (brCount === 1 && anyDriverSlotEmpty) {
      tips.push({
        id: 'garra_br_suggest',
        title: 'Samba no Asfalto 🇧🇷',
        description: 'Você já tem um piloto brasileiro. Se adicionar mais um, obterá o combo "Garra Brasileira", adicionando +6 no asfalto molhado!',
        priority: 'média',
        icon: 'heart'
      });
    }

    // Warnings to avoid (Binotto + Rueda)
    if (hasBinotto && isSlotEmpty('strategist')) {
      tips.push({
        id: 'avoid_inaki_rueda',
        title: '⚠️ Evite Iñaki Rueda!',
        description: 'Com Mattia Binotto de chefe, contratar Iñaki Rueda nos estrategistas provocará o catastrófico combo de desespero "Desastre Tático" (-10 Estratégia).',
        priority: 'aviso',
        targetSlotId: 'strategist',
        icon: 'alert'
      });
    } else if (hasRueda && isSlotEmpty('team_boss')) {
      tips.push({
        id: 'avoid_binotto',
        title: '⚠️ Evite Mattia Binotto!',
        description: 'Com Iñaki Rueda de estrategista, EVITE escolher Mattia Binotto como chefe de time para impedir gargalos e incidentes bizarros.',
        priority: 'aviso',
        targetSlotId: 'team_boss',
        icon: 'alert'
      });
    }

    // Aggressiveness Warning
    const aggValue = drivers.length > 0 ? (drivers.reduce((acc, d) => acc + (d.aggressiveness || 80), 0) / drivers.length) : 0;
    if (aggValue > 88 && anyDriverSlotEmpty) {
      tips.push({
        id: 'avoid_high_agg',
        title: '⚠️ Cuidado: Clima de Disputa!',
        description: `A agressividade média dos seus pilotos contratados está em ${Math.round(aggValue)}%. Evite novos pilotos pavão/agressivos para não ativar a punição "Box Explosivo".`,
        priority: 'aviso',
        icon: 'alert'
      });
    }

    // Standard tactical slot tips if nothing else takes high priority (below 3 tips)
    if (tips.length < 3) {
      if (isSlotEmpty('wet_specialist')) {
        tips.push({
          id: 'wet_tactical',
          title: 'Chuva no Horizonte 🌧️',
          description: 'A temporada conta com vários GPs sob chuva rigorosa (Cingapura, Interlagos). Consiga um bom piloto de Chuva (95+) para garantir pontos cruciais.',
          priority: 'baixa',
          targetSlotId: 'wet_specialist',
          icon: 'info'
        });
      }
      if (isSlotEmpty('strategist')) {
        tips.push({
          id: 'strat_tactical',
          title: 'Cérebro Técnico 🧠',
          description: 'O Estrategista controla como sua equipe lida com incidentes e pit-stops em pistas chuvosas.',
          priority: 'baixa',
          targetSlotId: 'strategist',
          icon: 'info'
        });
      }
      if (isSlotEmpty('chassis')) {
        tips.push({
          id: 'chassis_tactical',
          title: 'Espinha Dorsal do Carro 🏎️',
          description: 'O Chassi fornece o limite aerodinâmico (Aero) do carro de base. Não demore para selecionar esta espinha dorsal mecânica.',
          priority: 'baixa',
          targetSlotId: 'chassis',
          icon: 'info'
        });
      }
    }

    // Sort tips by priority points
    const priorityPoints: Record<string, number> = {
      'alta': 4,
      'aviso': 3,
      'média': 2,
      'baixa': 1
    };

    return tips.sort((a, b) => (priorityPoints[b.priority] || 0) - (priorityPoints[a.priority] || 0));
  };

  return (
    <div id="app_root" className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Ambient glowing background overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #FF1801 0%, transparent 70%)' }}></div>
      
      {/* HEADER SECTION */}
      <header id="header" className="h-16 border-b border-[#2A2A2A] bg-black/80 backdrop-blur-md px-6 sticky top-0 z-40 flex items-center justify-between">
        <div className="max-w-7xl w-full mx-auto flex justify-between items-center z-10">
          <div className="flex items-center space-x-4">
            <div className="bg-[#FF1801] text-white font-black px-3 py-1 text-xl italic tracking-tighter">
              7A0
            </div>
            <div className="h-6 w-[1px] bg-[#444]"></div>
            <div className="md:block hidden">
              <h1 className="font-display font-medium text-xs uppercase tracking-[0.2em] text-[#888] leading-none mb-1">Performance Telemetry</h1>
              <span className="text-[9px] text-[#555] font-mono block">F1 PADDOCK DRAFT v4.2</span>
            </div>
            <div className="md:hidden block">
              <h1 className="font-display font-bold text-sm tracking-tight text-white leading-none">7a0 Formula 1</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col text-right mr-2">
              <span className="text-[10px] uppercase text-[#666] font-bold font-mono">STATUS DO CANAL</span>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                PADDOCK REALTIME
              </span>
            </div>

            <button
              id="btn_enable_sound"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playBeep(880, 0.05);
              }}
              className={`px-3 py-1.5 rounded border text-[11px] font-mono font-bold flex items-center space-x-1.5 transition-all uppercase cursor-pointer ${
                soundEnabled 
                  ? 'border-[#FF1801]/60 text-[#FF1801] bg-[#FF1801]/10' 
                  : 'border-[#2A2A2A] text-[#666] hover:text-[#bbb] bg-[#0A0A0A]'
              }`}
              title={soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{soundEnabled ? 'Som On' : 'Som Off'}</span>
            </button>

            <button
              id="btn_help_rules"
              onClick={() => setRulesModalOpen(true)}
              className="p-1.5 text-[#888] hover:text-white rounded border border-[#2A2A2A] hover:border-[#444] bg-[#0A0A0A] transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST ALERTER */}
      {toastMessage && (
        <div id="toast" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A] border border-[#FF1801] text-[#E0E0E0] px-5 py-3 rounded shadow-[0_0_20px_rgba(255,24,1,0.3)] flex items-center space-x-3 text-xs font-mono animate-bounce">
          <Zap className="h-4 w-4 text-[#FF1801]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN LAYOUT GATEWAY */}
      <main id="main_content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center z-10">
        
        {/* ==================== 1. TELA HOME ==================== */}
        {gameMode === 'home' && (
          <>
          <div id="screen_home" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 items-center">
            
            {/* Esquerda: Banner / Apresentação */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FF1801]/15 border border-[#FF1801]/30 rounded-sm text-[#FF1801] text-xs font-mono uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-[#FF1801] pulse-led-red"></span>
                <span>Desafio 7x0 Recrutamento Paddock</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-white leading-tight">
                Monte sua escuderia dos sonhos de <span className="text-[#FF1801] font-bold italic">Fórmula 1</span> e desafie as lendas!
              </h2>

              <p className="text-[#888] text-sm sm:text-base leading-relaxed max-w-xl font-sans">
                Inspirado na clássica mecânica viral do site <strong>7a0</strong>, orquestre um grid de elite com 10 slots temáticos recrutando a partir de eras douradas, escuderias de glória e escoteiros clássicos do paddock. A simulação de corrida de alta fidelidade calculará seus pontos e definirá o seu destino.
              </p>

              {/* CTAs de início rápido */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
                <button
                  id="btn_start_normal"
                  onClick={() => handleStartGame('normal')}
                  className="bg-[#FF1801] hover:bg-red-700 active:scale-95 text-white font-display font-bold px-8 py-4 rounded transition-all hover:shadow-[0_0_20px_rgba(255,24,1,0.4)] text-base tracking-wider uppercase cursor-pointer flex-1 text-center min-w-[200px]"
                >
                  <Play className="h-4.5 w-4.5 mr-2 inline fill-current" />
                  <span>JOGAR MODO NORMAL</span>
                </button>

                <button
                  id="btn_start_hard"
                  onClick={() => handleStartGame('hard')}
                  className="bg-[#222] hover:bg-[#333] border border-[#333] text-[#E0E0E0] font-display font-bold px-6 py-4 rounded active:scale-95 transition-all text-base tracking-wider uppercase cursor-pointer flex-1 text-center min-w-[200px]"
                >
                  <EyeOff className="h-4.5 w-4.5 mr-2 inline text-gray-400" />
                  <span>MODO MEMÓRIA</span>
                </button>

                <button
                  id="btn_start_underdog"
                  onClick={() => handleStartGame('underdog')}
                  className="bg-zinc-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:bg-amber-500/10 font-display font-bold px-6 py-4 rounded active:scale-95 transition-all text-base tracking-wider uppercase cursor-pointer flex-1 text-center min-w-[200px] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <Trophy className="h-4.5 w-4.5 mr-2 inline text-amber-400" />
                  <span>MODO UNDERDOG</span>
                </button>

                <button
                  id="btn_goto_duelo_home"
                  onClick={() => {
                    setDuelPreviousMode('home');
                    setGameMode('duelo');
                    playBeep(523, 0.1);
                  }}
                  className="bg-black/40 hover:bg-[#111] border border-[#FF1801]/30 hover:border-[#FF1801]/80 text-[#E0E0E0] font-display font-bold px-6 py-4 rounded active:scale-95 transition-all text-base tracking-wider uppercase cursor-pointer flex-grow text-center"
                >
                  <Flame className="h-4.5 w-4.5 mr-2 inline text-[#FF1801]" />
                  <span>MODO DUELO</span>
                </button>
              </div>

              {/* Informações dos Modos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-sans text-neutral-400 max-w-3xl bg-neutral-900/30 p-4 rounded border border-neutral-800/60 leading-relaxed">
                <div className="flex gap-2.5">
                  <div className="text-amber-400 font-bold shrink-0">🐕 MODO UNDERDOG:</div>
                  <div>Tente o impossível! Assuma as <strong className="text-amber-300">piores/mais lentas equipes históricas da F1</strong> e desafie o grid com sabedoria, usando cartas de Buff ativo em tempo real nas corridas!</div>
                </div>
                <div className="flex gap-2.5">
                  <div className="text-neutral-300 font-bold shrink-0">🧠 MEMÓRIA:</div>
                  <div>Para puristas extremos do esporte. Jogue sem dicas visuais de combos ou ratings calculados de pilotos de antemão e prove que você domina a história do grid!</div>
                </div>
              </div>

              {/* Informação rápida de rodagem */}
              <div className="grid grid-cols-3 gap-6 border-t border-[#222] pt-6 max-w-lg text-xs font-mono">
                <div>
                  <span className="block text-[#666] uppercase font-bold text-[10px]">CORRIDAS</span>
                  <span className="text-white font-bold text-base block mt-0.5">8 GPs do Calendário</span>
                </div>
                <div>
                  <span className="block text-[#666] uppercase font-bold text-[10px]">PILOTOS</span>
                  <span className="text-white font-bold text-base block mt-0.5">Eras Clássicas F1</span>
                </div>
                <div>
                  <span className="block text-[#666] uppercase font-bold text-[10px]">CHEFE & CHASSI</span>
                  <span className="text-white font-bold text-base block mt-0.5">Sinergias Ativas</span>
                </div>
              </div>
            </div>

            {/* Direita: Histórico de Partidas e Modo de Exposição */}
            <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#222] rounded-lg p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[9px] text-[#444] font-mono italic uppercase tracking-wider">Historical Logs</div>
              
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3">
                <History className="h-4 w-4 text-[#FF1801]" />
                <h3 className="font-display font-bold uppercase tracking-wider text-[#E0E0E0] text-sm">Seu Histórico Recente</h3>
              </div>

              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-[#555] space-y-3">
                  <Trophy className="h-10 w-10 text-[#333] mx-auto" />
                  <p className="text-xs font-mono">Nenhum dado de telemetria disponível. Conclua uma temporada de draft para listar seus campeões.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {recentSessions.map((run, index) => (
                    <div key={run.id} className="p-3 bg-[#151515] hover:bg-[#1C1C1C] border border-[#222] rounded flex justify-between items-center text-xs transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">#0{index + 1} • {(run.champion || 'Nenhum').split(' ')[0]}</span>
                        </div>
                        <span className="text-[10px] text-[#666] font-mono">Finalizado às {run.timestamp}</span>
                      </div>

                      <div className="text-right">
                        <span className="block font-mono text-xs text-[#FF1801] font-bold">{run.points} Pts</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] border mt-1 font-mono tracking-wide ${run.rank.color}`}>
                          {run.rank.rank}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Guia resumo */}
              <div className="bg-[#151515]/40 border border-[#222] p-4 rounded text-xs space-y-2 leading-relaxed text-[#888]">
                <span className="font-bold text-gray-300 uppercase tracking-wider block text-[10px]">O que muda no Modo Memória?</span>
                No Modo Difícil, as classificações das estatísticas gerais numéricas são substituídas por pura intuição e sabedoria histórica. Recrute com base exclusivamente no seu conhecimento do automobilismo real!
              </div>
            </div>
          </div>

          {/* GUIA DE EXPLORAÇÃO DE PISTAS & TELEMETRIA DE BÔNUS */}
          <div id="circuits_guidance_section" className="mt-8 bg-[#0A0A0A] border border-[#222] rounded-lg p-5 sm:p-6 space-y-6 shadow-xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#222] pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <Compass className="h-5 w-5 text-[#FF1801]" />
                  <h3 className="font-display font-medium text-white text-base uppercase tracking-wider">
                    🏁 Guia de Circuitos & Telemetria de Climas
                  </h3>
                </div>
                <p className="text-xs text-gray-500 max-w-2xl font-sans">
                  Descubra as catedrais da velocidade da F1. Cada pista de corrida ativa bônus de performance especiais ou debuffs de risco para seus pilotos baseado em seus atributos reais.
                </p>
              </div>

              {/* Filtros rápidos dos estilos */}
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {[
                  { id: 'all', label: 'TUDO' },
                  { id: 'veloz', label: '⚡ VELOZ' },
                  { id: 'rua', label: '🚧 RUA' },
                  { id: 'técnico', label: '📐 TÉCNICO' },
                  { id: 'clássico', label: '🏆 CLÁSSICO' },
                  { id: 'wet', label: '🌧️ CHUVA ATIVA' }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`btn_filter_circuits_${item.id}`}
                    onClick={() => {
                      setCircuitFilter(item.id as any);
                      if (typeof playBeep === 'function') {
                        playBeep(400, 0.05);
                      }
                    }}
                    className={`px-3 py-1.5 rounded transition-all font-bold cursor-pointer border ${
                      circuitFilter === item.id
                        ? 'bg-[#FF1801] text-white border-[#FF1801] shadow-[0_0_10px_rgba(255,24,1,0.25)]'
                        : 'bg-[#111] text-gray-400 border-[#222] hover:text-white hover:border-[#444]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listagem em Bento Grid de Circuitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CIRCUITS.filter(rc => {
                if (circuitFilter === 'all') return true;
                if (circuitFilter === 'wet') return rc.isWet;
                return rc.type === circuitFilter;
              }).map((rc, idx) => {
                const isVeloz = rc.type === 'veloz';
                const isRua = rc.type === 'rua';
                const isTecnico = rc.type === 'técnico';
                const isClassico = rc.type === 'clássico';

                return (
                  <div
                    key={rc.name}
                    id={`circuit_card_${rc.name.toLowerCase().replace(/\s+/g, '_')}`}
                    className="group bg-gradient-to-b from-[#111] to-[#080808] border border-[#1C1C1C] hover:border-[#FF1801]/30 p-4 rounded transition-all duration-300 shadow flex flex-col justify-between space-y-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono text-gray-500 font-bold tracking-wider uppercase block">
                          Circuito {idx + 1}
                        </span>
                        
                        {/* Indicadores de Estilo e Clima */}
                        <div className="flex gap-1 items-center">
                          {rc.isWet && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wide border bg-sky-950/40 text-sky-400 border-sky-400/20 animate-pulse">
                              🌧️ CHUVA
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wide border uppercase ${
                            rc.type === 'veloz' ? 'bg-purple-950/40 text-purple-400 border-purple-400/20' :
                            rc.type === 'rua' ? 'bg-amber-950/40 text-amber-500 border-amber-500/20' :
                            rc.type === 'técnico' ? 'bg-blue-950/40 text-blue-400 border-blue-400/20' :
                            'bg-emerald-950/40 text-emerald-400 border-emerald-400/20'
                          }`}>
                            {rc.type === 'veloz' ? '⚡ VELOZ' :
                             rc.type === 'rua' ? '🚧 RUA' :
                             rc.type === 'técnico' ? '📐 TÉCNICO' :
                             '🏆 CLÁSSICO'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-display font-medium text-white leading-tight group-hover:text-[#FF1801] transition-colors">
                            {rc.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono italic mt-0.5 block">{rc.country}</span>
                      </div>

                      <p className="text-[11px] text-gray-500 leading-relaxed font-sans min-h-[44px]">
                        {rc.description}
                      </p>
                    </div>

                    {/* Bloco Dinâmico de Telemetria de Atributos */}
                    <div className="bg-black/60 border border-[#1A1A1A] rounded p-2.5 space-y-1.5 font-mono text-[9px] text-[#888]">
                      <div className="border-b border-[#222]/60 pb-1 flex justify-between items-center text-[8px] uppercase font-bold text-gray-500 tracking-wider">
                        <span>Fatores de Simulação</span>
                        <span className="text-gray-400">Impacto</span>
                      </div>

                      {/* Bônus do tipo */}
                      <div className="space-y-1 text-gray-400">
                        {rc.isWet ? (
                          <>
                            <div className="flex justify-between text-green-400 font-bold leading-none">
                              <span>🌧️ Chuva ≥ 94:</span>
                              <span>+6 Pts</span>
                            </div>
                            <div className="flex justify-between text-[#FF1801] font-bold leading-none mt-1">
                              <span>⚠️ Chuva &lt; 82:</span>
                              <span>-5 Pts</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-green-400 leading-none">
                              <span>⚡ Ritmo ≥ 97:</span>
                              <span>+4 Pts</span>
                            </div>
                            <div className="flex justify-between text-[#FF1801] leading-none">
                              <span>🐢 Ritmo &lt; 85:</span>
                              <span>-4 Pts</span>
                            </div>
                          </>
                        )}

                        {/* Extra dependente do tipo */}
                        {isVeloz && (
                          <div className="text-[8px] text-gray-600 italic border-t border-[#1a1a1a] pt-1 leading-normal">
                            A velocidade máxima do Chassi eleva o piloto em 50% da pontuação basilar de reta.
                          </div>
                        )}
                        {isRua && (
                          <>
                            <div className="flex justify-between text-green-400 leading-none border-t border-[#1C1C1C] pt-1">
                              <span>🛡️ Consistência ≥ 94:</span>
                              <span>+4 Pts</span>
                            </div>
                            <div className="flex justify-between text-[#FF1801] leading-none">
                              <span>💥 Consistência &lt; 84:</span>
                              <span>-4 Pts</span>
                            </div>
                          </>
                        )}
                        {isTecnico && (
                          <>
                            <div className="flex justify-between text-green-400 leading-none border-t border-[#1C1C1C] pt-1">
                              <span>📐 Consistência ≥ 95:</span>
                              <span>+3 Pts</span>
                            </div>
                            <div className="flex justify-between text-[#FF1801] leading-none">
                              <span>⛔ Agressividade ≥ 95:</span>
                              <span>-3 Pts</span>
                            </div>
                          </>
                        )}
                        {isClassico && (
                          <div className="flex justify-between text-emerald-400 leading-none border-t border-[#1C1C1C] pt-1">
                            <span>🏆 Consis./Confi. ≥ 92:</span>
                            <span>+3 Pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </>
        )}

        {/* ==================== 2. TELA DRAFT (GAMEPLAY) ==================== */}
        {gameMode === 'draft' && (
          <div id="screen_draft" className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
            
            {/* Coluna Esquerda (lg:col-span-5): Tabela de Progresso / Contratos Preenchidos */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex justify-between items-center bg-[#0A0A0A] border border-[#222] px-4 py-3 rounded">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono block leading-none">PROGRESSO DO RECRUTAMENTO</span>
                  <span className="font-display font-medium text-white text-sm mt-1 block">Slots: {Object.keys(slots).length} de 10</span>
                </div>
                <div className="bg-[#151515] px-3 py-1 rounded border border-[#222]">
                  <span className="font-mono text-xs text-[#FF1801] font-bold">Média: {activeAvgRating()}/100</span>
                </div>
              </div>

              {/* Tabela vertical de cards dos Slots */}
              <div className="space-y-2 max-h-[46vh] lg:max-h-[48vh] xl:max-h-[50vh] overflow-y-auto pr-1">
                {GAME_SLOTS.map((slot, idx) => {
                  const filled = slots[slot.id];
                  const isActive = idx === activeSlotIndex;
                  const IconComponent = IconMap[slot.icon] || User;

                  return (
                    <div
                      key={slot.id}
                      id={`slot_card_${slot.id}`}
                      onClick={() => handleSelectSlotIndex(idx)}
                      className={`p-3 rounded border transition-all flex items-center justify-between cursor-pointer hover:border-[#FF1801]/60 ${
                        isActive
                          ? 'border-[#FF1801] bg-[#FF1801]/10 shadow-[0_0_15px_rgba(255,24,1,0.2)] text-white font-bold'
                          : filled
                          ? 'border-[#222] bg-[#0A0A0A] text-[#E0E0E0] hover:bg-[#151515]/60'
                          : 'border-[#1A1A1A]/40 bg-black/20 opacity-50 text-gray-500 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded ${
                          isActive 
                            ? 'bg-[#FF1801] text-white' 
                            : filled 
                            ? 'bg-[#151515] text-[#FF1801]' 
                            : 'bg-[#111] text-gray-600'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-[9px] text-[#666] uppercase font-mono block leading-none mb-1">
                            {slot.name}
                          </span>
                          {filled ? (
                            <span className="block text-sm font-bold text-white truncate font-display">
                              {filled.name}
                            </span>
                          ) : (
                            <span className="block text-xs text-gray-500 italic">
                              {isActive ? 'Contratando...' : 'Fila de Telemetria'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Informações de estatísticas / notas no lado direito do slot */}
                      <div className="text-right">
                        {filled ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400 bg-black border border-[#222] px-1.5 py-0.5 rounded font-mono">
                              {filled.sourceSeason}
                            </span>
                            
                            {difficultyMode === 'normal' ? (
                              <span className="text-xs font-mono font-bold bg-[#151515] text-cyan-400 border border-[#222] px-2 py-0.5 rounded">
                                {filled.rating_geral}
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold bg-[#151515] text-gray-400 border border-[#222] px-2 py-0.5 rounded">
                                ?
                              </span>
                            )}
                          </div>
                        ) : (
                          isActive && (
                            <span className="inline-block h-2 w-2 rounded-full bg-[#FF1801] pulse-led-red"></span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Painel Dicas de Paddock / Sugestão de Sinergia */}
              <div id="paddock_tips_panel" className="bg-[#0A0A0A] border border-[#222] p-4 rounded-md space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Brain className="h-4 w-4 text-[#FF1801] animate-pulse" />
                    <span className="font-display font-medium text-white text-xs uppercase tracking-wider">🎙️ Dicas do Paddock</span>
                  </div>
                  <span className="text-[8px] bg-[#FF1801]/10 text-[#FF1801] border border-[#FF1801]/25 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest font-bold">
                    Sinergia Ativa
                  </span>
                </div>

                <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-0.5">
                  {getPaddockTips().slice(0, 3).map((tip) => {
                    const TipIcon = tipIconMap[tip.icon] || Info;
                    const isSelectable = !!tip.targetSlotId;

                    let borderClass = 'border-l-2 border-gray-600 bg-[#0c0c0c] text-gray-350';
                    let badgeClass = 'bg-[#151515] text-gray-400';
                    let badgeText = 'Geral';

                    if (tip.priority === 'alta') {
                      borderClass = 'border-l-2 border-[#FF1801] bg-[#FF1801]/5 text-[#FFD8D5]';
                      badgeClass = 'bg-[#FF1801]/15 text-[#FF1801]';
                      badgeText = 'ALTA PRIORIDADE';
                    } else if (tip.priority === 'aviso') {
                      borderClass = 'border-l-2 border-amber-500 bg-amber-500/5 text-[#FFEED5]';
                      badgeClass = 'bg-amber-500/15 text-amber-500';
                      badgeText = 'RISCO/AVISO';
                    } else if (tip.priority === 'média') {
                      borderClass = 'border-l-2 border-cyan-400 bg-cyan-400/5 text-[#E0F7FF]';
                      badgeClass = 'bg-cyan-400/15 text-cyan-400';
                      badgeText = 'SUGESTÃO/CENÁRIO';
                    } else if (tip.priority === 'baixa') {
                      borderClass = 'border-l-2 border-slate-500 bg-slate-500/5 text-[#F0F0F0]';
                      badgeClass = 'bg-slate-500/15 text-slate-400';
                      badgeText = 'RECOMENDAÇÃO';
                    }

                    return (
                      <div
                        key={tip.id}
                        id={`paddock_tip_${tip.id}`}
                        onClick={() => {
                          if (isSelectable && tip.targetSlotId) {
                            const targetIdx = GAME_SLOTS.findIndex(s => s.id === tip.targetSlotId);
                            if (targetIdx !== -1) {
                              handleSelectSlotIndex(targetIdx);
                              playBeep(440, 0.05);
                            }
                          }
                        }}
                        className={`p-2.5 rounded-sm border border-[#1d1d1d]/60 text-[10px] leading-relaxed transition-all flex flex-col space-y-1.5 ${borderClass} ${
                          isSelectable ? 'cursor-pointer hover:border-[#FF1801]/40 hover:translate-x-0.5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[8px] font-bold">
                          <div className="flex items-center space-x-1">
                            <TipIcon className="h-3 w-3 shrink-0" />
                            <span className="uppercase">{tip.title}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded-sm ${badgeClass}`}>
                            {badgeText}
                          </span>
                        </div>
                        <p className="font-sans text-gray-400 font-normal leading-normal">
                          {tip.description}
                        </p>
                        {isSelectable && (
                          <div className="flex items-center space-x-1 text-[8px] text-[#FF1801] font-mono font-bold uppercase pt-0.5">
                            <span>🎯 CLIQUE PARA IR AO SLOT DO TELEMETRIA</span>
                            <ChevronRight className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {getPaddockTips().length === 0 && (
                    <div className="p-3 text-center text-gray-500 text-[10px] italic font-sans">
                      Nenhuma recomendação no momento. Continue preenchendo as vagas livremente!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita (lg:col-span-7): Workspace do Sorteio Ativo */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Box de Instrução Superior */}
              <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-[8px] text-[#444] font-mono uppercase tracking-widest leading-none">Info</div>
                <span className="px-2 py-0.5 rounded bg-[#FF1801]/15 text-[#FF1801] font-mono text-[9px] uppercase border border-[#FF1801]/30">
                  SLOT SELECIONADO: {GAME_SLOTS[activeSlotIndex].name}
                </span>
                <p className="text-xs text-[#888] leading-relaxed">
                  {GAME_SLOTS[activeSlotIndex].description}
                </p>
              </div>

              {/* Box Principal de Sorteio */}
              {activeCombo ? (
                <div className="bg-[#0A0A0A] border border-[#222] rounded overflow-hidden shadow-2xl relative">
                  
                  {/* Faixa Superior Temática Decorativa com Cores do Time Sorteado */}
                  <div className="bg-[#111] px-6 py-4 border-b border-[#222] flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#FF1801] text-white font-mono font-bold text-[10px] px-2 py-0.5 italic text-center">
                        SORTEADO
                      </div>
                      <div>
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase leading-none mb-1">EQUIPE & ERA CLÁSSICA</h4>
                        <span className="text-lg font-display font-medium text-white tracking-tight leading-none block">
                          {activeCombo.teamName} • {activeCombo.season}
                        </span>
                      </div>
                    </div>

                    {/* Botão de Coringa / Re-roll */}
                    <button
                      id="btn_use_joker"
                      onClick={handleUseJoker}
                      disabled={!jokerAvailable}
                      className={`px-4 py-2 rounded-sm font-display text-[10px] font-bold tracking-wider flex items-center space-x-1.5 transition-all uppercase cursor-pointer ${
                        jokerAvailable
                          ? 'bg-amber-500 hover:bg-amber-400 text-black hover:scale-[1.03] active:scale-95'
                          : 'bg-[#151515] text-[#444] cursor-not-allowed border border-[#222]'
                      }`}
                    >
                      <Dices className="h-3.5 w-3.5" />
                      <span>{jokerAvailable ? 'USAR CORINGA' : 'BUSCA ESGOTADA'}</span>
                    </button>
                  </div>

                  {/* Descrição do pacote sorteado */}
                  <div className="px-6 py-3 bg-[#FF1801]/5 border-b border-[#FF1801]/10 text-xs text-[#888] leading-relaxed italic">
                    💡 O bólido e a engenharia apontaram para {activeCombo.teamName} na temporada histórica de {activeCombo.season}. Recrute as alternativas compatíveis abaixo para consolidar seu tempo de volta!
                  </div>

                  {/* Espaço de Candidatos Elegíveis */}
                  <div className="p-6 space-y-4">
                    <h5 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Alternativas Oficiais de Contrato:</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidates.map((cand) => {
                        const slotId = GAME_SLOTS[activeSlotIndex]?.id;
                        const currentComboNames = detectCombos(slots).map(c => c.name);
                        const simulatedCombos = slotId ? detectCombos({ ...slots, [slotId]: cand }) : [];
                        const activatedCombos = simulatedCombos.filter(c => !currentComboNames.includes(c.name));

                        return (
                          <div
                            key={cand.id || cand.name}
                            id={`candidate_card_${cand.id || cand.name}`}
                            onClick={() => handleSelectCandidate(cand)}
                            className="bg-[#050505] border border-[#222] hover:border-[#FF1801] hover:bg-[#111]/30 rounded p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-left group flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] text-[#666] font-mono block">
                                    {cand.country || 'Paddock'}
                                  </span>
                                  <h6 className="font-display font-medium text-white text-sm tracking-tight leading-tight group-hover:text-[#FF1801] transition-colors">
                                    {cand.name}
                                  </h6>
                                </div>

                                {difficultyMode === 'normal' ? (
                                  <span className="bg-[#FF1801]/15 border border-[#FF1801]/30 text-[#FF1801] font-mono font-bold text-[10px] px-2 py-0.5 rounded-sm">
                                    RATING {cand.rating_geral}
                                  </span>
                                ) : (
                                  <span className="bg-[#222] border border-[#333] text-gray-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded-sm">
                                    CHASSI SEGREDO
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#888] leading-snug">
                                {cand.description}
                              </p>

                              {activatedCombos.length > 0 && (
                                <div className="mt-2.5 space-y-1">
                                  {activatedCombos.map((cb) => {
                                    const isNegative = cb.bonusValue < 0;
                                    return (
                                      <div
                                        key={cb.name}
                                        className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold border uppercase tracking-wider ${
                                          isNegative
                                            ? 'bg-red-950/25 text-[#FF1801] border-red-900/30'
                                            : 'bg-green-950/30 text-green-400 border-green-900/30'
                                        }`}
                                      >
                                        <span>{isNegative ? '⚠️ ALERTA:' : '✨ COMBO:'}</span>
                                        <span className="truncate">{cb.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Detalhes de atributos base */}
                            <div className="border-t border-[#1C1C1C] pt-3 mt-4 space-y-2 text-[10px] font-mono">
                              {cand.entityType === 'driver' && (
                                <div className="grid grid-cols-3 gap-1 text-center text-gray-400">
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222]">
                                    <span className="block text-[8px] text-[#666] leading-none">RITMO</span>
                                    <span className="font-bold text-[#E0E0E0]">{difficultyMode === 'normal' ? cand.pace : '???'}</span>
                                  </div>
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222]">
                                    <span className="block text-[8px] text-[#666] leading-none">CONST</span>
                                    <span className="font-bold text-[#E0E0E0]">{difficultyMode === 'normal' ? cand.consistency : '???'}</span>
                                  </div>
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222] font-bold text-cyan-400">
                                    <span className="block text-[8px] text-[#555] leading-none">CHUVA</span>
                                    <span>{difficultyMode === 'normal' ? cand.chuva : '???'}</span>
                                  </div>
                                </div>
                              )}

                              {cand.entityType === 'boss' && (
                                <div className="grid grid-cols-2 gap-1 text-center text-gray-400">
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222]">
                                    <span className="block text-[8px] text-[#666] leading-none">LIDERANÇA</span>
                                    <span className="font-bold text-[#E0E0E0]">{difficultyMode === 'normal' ? cand.leadership : '???'}</span>
                                  </div>
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222]">
                                    <span className="block text-[8px] text-[#666] leading-none">PRESTÍGIO</span>
                                    <span className="font-bold text-[#E0E0E0]">{difficultyMode === 'normal' ? cand.prestige : '???'}</span>
                                  </div>
                                </div>
                              )}

                              {cand.entityType === 'chassis' && (
                                <div className="grid grid-cols-2 gap-1 text-center text-gray-400">
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222]">
                                    <span className="block text-[8px] text-[#666] leading-none">V_MÁXIMA</span>
                                    <span className="font-bold text-[#E0E0E0]">{difficultyMode === 'normal' ? cand.top_speed : '???'}</span>
                                  </div>
                                  <div className="bg-[#111] p-1 rounded-sm border border-[#222]">
                                    <span className="block text-[8px] text-[#666] leading-none">AERO</span>
                                    <span className="font-bold text-[#E0E0E0]">{difficultyMode === 'normal' ? cand.aerodynamics : '???'}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end pt-1">
                                <span className="text-[9px] text-[#FF1801] flex items-center space-x-1 font-bold group-hover:translate-x-1 transition-transform">
                                  <span>CONTRATAR ELEMENTO</span>
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#0A0A0A] border border-[#222] rounded p-8 text-center space-y-4">
                  <Dices className="h-12 w-12 text-[#FF1801] mx-auto animate-pulse" />
                  <p className="text-sm font-mono text-[#888]">Aguardando conexão com as eras de F1 no paddock...</p>
                </div>
              )}

              {/* Alerta de combos detectados dinâmicos */}
              {Object.keys(slots).length > 0 && (
                <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-[#444] font-mono uppercase tracking-widest leading-none">Engine</div>
                  <div className="flex items-center space-x-1">
                    <Sparkle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs uppercase font-mono font-bold text-white">Sinergias de Box Ativadas:</span>
                  </div>
                  {detectCombos(slots).length === 0 ? (
                    <span className="text-[11px] text-[#666] italic block font-sans">Selecione afinidades históricas reais (ex: Senna + McLaren, Schumacher + Jean Todt) para desbloquear bônus passivos de velocidade!</span>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {detectCombos(slots).map(cb => (
                        <span key={cb.name} className="px-2 py-1 bg-amber-950/20 border border-amber-600/30 text-amber-400 rounded text-[10px] font-mono font-bold tracking-wide">
                          🚀 {cb.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ==================== 3. TELA DE SIMULAÇÃO (START LIGHTS & GP CALENDAR) ==================== */}
        {gameMode === 'simulating' && (
          <div id="screen_simulating" className="max-w-2xl w-full mx-auto bg-[#0A0A0A] border border-[#222] rounded p-6 sm:p-8 space-y-8 text-center shadow-2xl my-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[8px] text-[#444] font-mono uppercase tracking-widest leading-none">Telemetry engine v42</div>
            
            {/* Countdown de largada F1 */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest block">LARGADA DO CAMPEONATO MUNDIAL</span>
              
              {/* As 5 luzes do semáforo da F1 */}
              <div className="flex justify-center space-x-4 py-4 bg-black/60 rounded border border-[#222] max-w-sm mx-auto">
                {[1, 2, 3, 4, 5].map((lightNum) => {
                  const isOn = simLightsCount >= lightNum && simLightsCount < 6;
                  return (
                    <div
                      key={lightNum}
                      className="flex flex-col items-center space-y-1.5"
                    >
                      {/* Lâmpadas vermelhas */}
                      <div className="bg-[#1C0506] border border-[#331112] p-1 rounded-full">
                        <div className={`h-8 w-8 rounded-full transition-all duration-100 ${
                          isOn 
                            ? 'bg-[#FF1801] shadow-[0_0_20px_#FF1801] animate-pulse border border-[#FF1801]' 
                            : 'bg-stone-900 border border-stone-950'
                        }`} />
                      </div>
                      
                      {/* Painelzinho indicativo */}
                      <div className="h-1.5 w-1.5 rounded-full bg-[#111]" />
                    </div>
                  );
                })}
              </div>

              {simLightsCount < 6 ? (
                <p className="text-[11px] text-[#FF1801] font-mono tracking-wider animate-pulse uppercase">Sincronizando mureta de largada...</p>
              ) : (
                <p className="text-sm font-display font-medium text-green-500 tracking-wide uppercase italic">LARGADA AUTORIZADA! PUSH NOW!</p>
              )}
            </div>

            {/* Progresso de Corridas do Calendário */}
            {simLightsCount >= 6 && (
              <div className="space-y-6 animate-fade-in z-10">
                <div className="border-t border-[#222] pt-6">
                  <h4 className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">CALENDÁRIO DE PROVAS ({CIRCUITS.length} ETAPAS):</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {CIRCUITS.map((rc, idx) => {
                    const isCompeted = idx < simActiveRaceIdx;
                    const isNow = idx === simActiveRaceIdx;
                    const winnerOfGp = isCompeted && simulationResult?.raceResults[idx]?.podium[0];

                    return (
                      <div
                        key={rc.name}
                        className={`p-2.5 rounded border text-left flex flex-col justify-between h-24 transition-all ${
                          isNow
                            ? 'border-[#FF1801] bg-[#FF1801]/10 scale-102 shadow-[0_0_12px_rgba(255,24,1,0.25)] text-white'
                            : isCompeted
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-gray-300'
                            : 'border-[#1C1C1C] bg-[#050505]/40 text-gray-600'
                        }`}
                      >
                        <div>
                          <span className="text-[8px] font-mono font-bold block mb-1 text-gray-400">
                            ETAPA {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <span className="block text-[11px] font-display font-semibold truncate text-white leading-tight" title={rc.name}>
                            {rc.name.replace('Grande Prêmio ', 'GP ')}
                          </span>
                        </div>

                        <div>
                          {isNow && (
                            <span className="text-[9px] text-[#FF1801] font-mono flex items-center space-x-1 animate-pulse font-bold">
                              <span className="h-1.5 w-1.5 bg-[#FF1801] rounded-full"></span>
                              <span>LIVE SIM...</span>
                            </span>
                          )}

                          {isCompeted && winnerOfGp && (
                            <div className="text-[10px] text-green-400 font-mono flex items-center space-x-1">
                              <Trophy className="h-3 w-3 inline text-amber-500 shrink-0" />
                              <span className="truncate">
                                {typeof winnerOfGp === 'string'
                                  ? (winnerOfGp.split(' ').pop() || winnerOfGp)
                                  : (winnerOfGp.driver ? (winnerOfGp.driver.split(' ').pop() || winnerOfGp.driver) : 'Nenhum')}
                              </span>
                            </div>
                          )}

                          {!isCompeted && !isNow && (
                            <span className="text-[9px] text-[#444] font-mono font-bold">FECHADO</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Caixa informativa do progresso do campeonato */}
                <div className="bg-[#050505] border border-[#222] p-4 rounded text-xs space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                    <span>PROGRESSO GERAL</span>
                    <span>{simActiveRaceIdx + 1} de {CIRCUITS.length} corridas simuladas</span>
                  </div>
                  <div className="w-full bg-[#151515] h-1.5 rounded overflow-hidden border border-[#222]/50">
                    <div
                      className="bg-[#FF1801] h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,24,1,0.5)]"
                      style={{ width: `${((simActiveRaceIdx + 1) / CIRCUITS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 🛒 BARRA DE SUPORTE E BUFFS EM TEMPO REAL */}
                <div className="border border-neutral-800 bg-neutral-950/60 p-5 rounded text-left mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <h4 className="text-sm font-display font-medium text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        Paddock Command: Cartas de Suporte
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                        {simActiveRaceIdx >= 0 
                          ? `Ative agora no GP corrente: ${CIRCUITS[simActiveRaceIdx]?.name}`
                          : "Aguarde o início das etapas para injetar telemetria na corrida ativa!"}
                      </p>
                    </div>
                    {difficultyMode === 'underdog' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-200 border border-amber-500/30 font-bold uppercase tracking-widest font-mono shrink-0">
                        UNDERDOG ADVANTAGE 🐕
                      </span>
                    )}
                  </div>

                  {availableCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {availableCards.map((card) => {
                        const IconComponent = IconMap[card.icon] || Zap;
                        const isSimActive = simActiveRaceIdx >= 0 && !simRaceCompleted;
                        return (
                          <div
                            key={card.id}
                            className={`flex flex-col justify-between p-3.5 rounded border ${card.color} transition-all relative group overflow-hidden ${
                              isSimActive 
                                ? 'hover:scale-[1.02] hover:border-white/40 cursor-pointer shadow-lg' 
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (!isSimActive) {
                                triggerToast('⚠️ Aguarde a largada das corridas para ativar os buffs!');
                                return;
                              }
                              setSelectedCardToUse(card);
                              setActiveBuffModals(true);
                              playBeep(440, 0.1);
                            }}
                          >
                            <div className="space-y-1.5 min-h-[70px]">
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-display font-bold text-xs uppercase leading-tight tracking-wide">{card.name}</span>
                                <IconComponent className="h-4 w-4 shrink-0 opacity-80" />
                              </div>
                              <p className="text-[10px] text-neutral-300 leading-normal font-sans">{card.description}</p>
                            </div>

                            <button
                              disabled={!isSimActive}
                              className={`w-full mt-3 py-1.5 text-[9px] font-mono rounded tracking-widest uppercase font-bold transition-all ${
                                isSimActive 
                                  ? 'bg-white/10 hover:bg-white text-white hover:text-black hover:shadow-md cursor-pointer' 
                                  : 'bg-neutral-900 text-neutral-600'
                              }`}
                            >
                              ATIVAR AGORA
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500 bg-neutral-900/30 rounded border border-neutral-800/40">
                      <p className="text-xs font-mono">⚠️ Todas as cartas de suporte foram consumidas neste campeonato!</p>
                    </div>
                  )}

                  {/* Histórico Recente de Buffs Aplicados */}
                  {buffHistory.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5 pt-3 border-t border-neutral-900 text-[10px] font-mono text-neutral-400">
                      <span className="uppercase text-neutral-500 font-bold text-[9px] tracking-wider">Histórico de Ativações:</span>
                      {buffHistory.map((hist, hIdx) => (
                        <div key={hIdx} className="flex gap-2 items-center bg-emerald-950/20 px-2 py-1.5 rounded border border-emerald-950/30 text-emerald-400">
                          <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
                          <span>{hist}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão de feedback para acelerar e ir para resultados */}
                {simRaceCompleted && (
                  <button
                    id="btn_view_grand_results"
                    onClick={handleShowFinalResults}
                    className="w-full bg-[#FF1801] hover:bg-red-700 hover:shadow-[0_0_20px_rgba(255,24,1,0.4)] text-white font-display font-bold p-4 rounded-sm flex items-center justify-center space-x-2 transition-all active:scale-95 animate-bounce mt-4 cursor-pointer tracking-widest uppercase text-sm"
                  >
                    <Trophy className="h-5 w-5 text-amber-400 fill-current" />
                    <span>VER CLASSIFICAÇÃO & RESULTADOS GERAIS</span>
                  </button>
                )}

              </div>
            )}

          </div>
        )}

        {/* ==================== 4. TELA DE RESULTADOS (PODIUM & STANDINGS) ==================== */}
        {gameMode === 'results' && simulationResult && (
          <div id="screen_results" className="space-y-6 py-2">
            
            {/* Box Hero Superior: Notas Gerais e Pódio */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[8px] text-[#444] font-mono uppercase tracking-widest leading-none">Championship metrics</div>
              
              <div className="space-y-4 text-center md:text-left z-10">
                <span className="px-2.5 py-1 bg-[#FF1801]/15 text-[#FF1801] font-mono text-xs uppercase border border-[#FF1801]/30 rounded-sm">
                  RESULTADO DA TEMPORADA SIMULADA
                </span>

                <h3 className="text-3xl font-display font-bold text-white tracking-tight leading-none">
                  Fim de Temporada!
                </h3>

                <p className="text-[#888] text-xs sm:text-sm leading-relaxed max-w-xl font-sans">
                  Seus pilotos e escuderia completaram as {CIRCUITS.length} etapas históricas do campeonato de F1 enfrentando as maiores lendas de todos os tempos. Veja os resultados de telemetria abaixo!
                </p>

                {/* Combos ativados */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-gray-500 block uppercase font-mono tracking-widest leading-none">COMBOS DE BOX ATIVOS:</span>
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {detectCombos(slots).length === 0 ? (
                      <span className="text-xs text-gray-500 italic block">Nenhum combo lendário ativado</span>
                    ) : (
                      detectCombos(slots).map(cb => (
                        <div key={cb.name} className="px-2.5 py-1 rounded bg-amber-950/20 border border-amber-600/30 text-amber-400 text-xs font-mono font-bold">
                          🔥 {cb.name} (+{cb.bonusValue} sim)
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Placa de Rating da equipe draftada */}
              <div className="w-full md:w-auto bg-[#111] border border-[#222] p-6 rounded text-center space-y-3 min-w-[220px] z-10">
                <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">RATING DO SEU TIME</span>
                
                <div className="space-y-1">
                  <span className="block text-4xl font-display font-black text-white leading-none italic">
                    {activeAvgRating()}<span className="text-sm text-gray-500 font-mono">/100</span>
                  </span>
                  
                  <span className={`inline-block px-3 py-1 rounded-sm border text-[10px] font-mono font-bold uppercase ${evaluateQualityRank(activeAvgRating()).color}`}>
                    Cenário {evaluateQualityRank(activeAvgRating()).rank}
                  </span>
                </div>

                <div className="border-t border-[#222] pt-3">
                  <button
                    id="btn_share_result"
                    onClick={handleCopyShareText}
                    className="w-full bg-[#FF1801] hover:bg-red-700 text-white font-display font-bold px-4 py-2.5 rounded-sm text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(255,24,1,0.4)]"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>COPIAR RESULTADO</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Narrativa de Paddock */}
            <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[8px] text-[#444] font-mono uppercase tracking-widest leading-none">Highlights feed</div>
              <span className="text-[10px] uppercase font-mono text-[#FF1801] font-bold block tracking-widest leading-none">NARRATIVAS & HIGHLIGHTS DO PADDOCK:</span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {simulationResult.narrationHighlights.map((line: string, index: number) => (
                  <div key={index} className="text-xs text-[#E0E0E0] flex items-start space-x-2 border-b border-[#222] pb-2 last:border-0 last:pb-0">
                    <span className="text-[#FF1801] font-mono mt-0.5 font-bold">•</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção das Tabelas de Pontos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box Mundial de Pilotos */}
              <div className="bg-[#0A0A0A] border border-[#222] rounded p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <span className="font-display font-bold text-white text-base">Classificação Mundial de Pilotos</span>
                  <Trophy className="h-4.5 w-4.5 text-amber-500" />
                </div>

                <div className="space-y-2 overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-400 font-mono">
                    <thead>
                      <tr className="border-b border-[#222] text-gray-500 font-bold uppercase text-[9px] pb-2">
                        <th className="py-2">Pos</th>
                        <th>Piloto</th>
                        <th>Escuderia</th>
                        <th className="text-center">Vit</th>
                        <th className="text-center">Pod</th>
                        <th className="text-center text-[#FF1801]">DNF</th>
                        <th className="text-right text-white">Pontos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.driverStandings.map((drv: any, idx: number) => {
                        return (
                          <tr
                            key={`standing-${drv.driver}-${drv.team}-${idx}`}
                            className={`border-b border-black/40 last:border-0 ${
                              drv.isUser 
                                ? 'bg-[#FF1801]/10 border-l-2 border-[#FF1801] text-white font-bold' 
                                : ''
                            }`}
                          >
                            <td className="py-2.5 px-1 font-bold">{idx + 1}</td>
                            <td className="text-white max-w-[160px] truncate flex items-center space-x-1.5 py-1">
                              <span className="truncate">{drv.driver}</span>
                              <button
                                onClick={() => {
                                  // Look up the driver stats based on drv.driver
                                  const foundHistorical = historicalDrivers.find(d => d.name === drv.driver);
                                  const targetDriver = foundHistorical || {
                                    id: drv.driver.replace(/\s+/g, '_').toLowerCase(),
                                    name: drv.driver,
                                    country: 'Grid',
                                    titles: 0, wins: drv.wins, podiums: drv.podiums, poles: 0,
                                    rating_geral: 90,
                                    pace: 90,
                                    consistency: 90,
                                    chuva: 90,
                                    aggressiveness: 85,
                                    reliability: 90,
                                  };
                                  
                                  setDuelCompetitorB(targetDriver);
                                  
                                  // Set Competitor A to user's first principal driver if available, otherwise first historical
                                  const u1 = slots['driver_1'];
                                  if (u1) {
                                    setDuelCompetitorA({
                                      ...u1,
                                      id_season: 'user_driver_1',
                                      sourceTeam: 'Sua Equipe (Titular 1)',
                                      sourceSeason: 'Atual',
                                      displayName: `⭐ ${u1.name} (Seu Titular 1)`
                                    });
                                  } else {
                                    setDuelCompetitorA(historicalDrivers[0]);
                                  }
                                  
                                  setDuelPreviousMode('results');
                                  setGameMode('duelo');
                                  playBeep(523, 0.1);
                                }}
                                className="opacity-70 hover:opacity-100 p-0.5 rounded text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer inline-flex"
                                title={`Duelo contra ${drv.driver}`}
                              >
                                <Flame className="h-3 w-3 inline" />
                              </button>
                            </td>
                            <td className="max-w-[100px] truncate">{drv.team}</td>
                            <td className="text-center">{drv.wins}</td>
                            <td className="text-center">{drv.podiums}</td>
                            <td className="text-center text-[#FF1801]">{drv.dnfCount}</td>
                            <td className="text-right text-[#FF1801] font-bold">{drv.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Box Mundial de Construtores */}
              <div className="bg-[#0A0A0A] border border-[#222] rounded p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <span className="font-display font-bold text-white text-base">Mundial de Construtores (Marcas)</span>
                  <Flag className="h-4.5 w-4.5 text-blue-500" />
                </div>

                <div className="space-y-2">
                  <table className="w-full text-left text-xs text-gray-400 font-mono">
                    <thead>
                      <tr className="border-b border-[#222] text-gray-500 font-bold uppercase text-[9px] pb-2">
                        <th className="py-2">Pos</th>
                        <th>Equipe de F1</th>
                        <th className="text-right text-white">Pontos Finais</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.teamStandings.map((tm: any, idx: number) => {
                        return (
                          <tr
                            key={tm.team}
                            className={`border-b border-black/40 last:border-0 ${
                              tm.isUser 
                                ? 'bg-[#FF1801]/10 border-l-2 border-[#FF1801] text-white font-bold' 
                                : ''
                            }`}
                          >
                            <td className="py-3 px-1 font-bold">{idx + 1}</td>
                            <td className="text-white">{tm.team}</td>
                            <td className="text-right text-[#FF1801] font-bold">{tm.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Exibição da Equipe Completa Escolhida */}
                <div className="border-t border-[#222] pt-4 mt-6">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider mb-2">SEU TIME CONTRATADO EM PISTA:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-[#111] p-2 rounded border border-[#222]">
                      <span className="text-[9px] text-gray-500 block font-mono">PILOTO 1:</span>
                      <span className="font-bold text-white truncate block font-display">{slots['driver_1']?.name || 'Vazio'}</span>
                    </div>
                    <div className="bg-[#111] p-2 rounded border border-[#222]">
                      <span className="text-[9px] text-gray-500 block font-mono">PILOTO 2:</span>
                      <span className="font-bold text-white truncate block font-display">{slots['driver_2']?.name || 'Vazio'}</span>
                    </div>
                    <div className="bg-[#111] p-2 rounded border border-[#222]">
                      <span className="text-[9px] text-gray-500 block font-mono">CHASSI:</span>
                      <span className="font-bold text-white truncate block font-display">{slots['chassis']?.name || 'Vazio'}</span>
                    </div>
                    <div className="bg-[#111] p-2 rounded border border-[#222]">
                      <span className="text-[9px] text-gray-500 block font-mono">ENGENHEIRO:</span>
                      <span className="font-bold text-white truncate block font-display">{slots['engineer']?.name || 'Vazio'}</span>
                    </div>
                    <div className="bg-[#111] p-2 rounded border border-[#222]">
                      <span className="text-[9px] text-gray-500 block font-mono">CHEFE:</span>
                      <span className="font-bold text-white truncate block font-display">{slots['team_boss']?.name || 'Vazio'}</span>
                    </div>
                    <div className="bg-[#111] p-2 rounded border border-[#222]">
                      <span className="text-[9px] text-gray-500 block font-mono">ESTRATEGISTA:</span>
                      <span className="font-bold text-white truncate block font-display">{slots['strategist']?.name || 'Vazio'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Gráfico de Evolução da Temporada (Recharts) */}
            <div id="season_progression_graph_section" className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#222] pb-4">
                <div className="flex items-center space-x-2.5">
                  <Award className="h-5 w-5 text-[#FF1801]" />
                  <h3 className="font-display font-medium text-white text-sm uppercase tracking-wider">
                    📈 Gráfico de Evolução da Temporada
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-gray-400 uppercase mt-1 sm:mt-0">
                  Desempenho acumulado por GP contra o rival do campeonato
                </span>
              </div>

              <div className="w-full pt-1">
                <div className="h-80 w-full bg-[#050505]/40 border border-[#1a1a1a] p-3 rounded-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={seasonProgressionData}
                      margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid stroke="#151515" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#333"
                        tick={{ fill: '#777', fontSize: 9, fontFamily: 'monospace' }}
                        tickLine={{ stroke: '#222' }}
                      />
                      <YAxis 
                        stroke="#333"
                        tick={{ fill: '#777', fontSize: 9, fontFamily: 'monospace' }}
                        tickLine={{ stroke: '#222' }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Seu Time"
                        stroke="#FF1801"
                        strokeWidth={3}
                        dot={{ r: 4, stroke: '#FF1801', strokeWidth: 1.5, fill: '#050505' }}
                        activeDot={{ r: 6, stroke: '#FF1801', strokeWidth: 2, fill: '#ffffff' }}
                        name="Seu Time"
                      />
                      {seasonProgressionData[0] && (
                        <Line
                          type="monotone"
                          dataKey={seasonProgressionData[0].rivalTeamName}
                          stroke={seasonProgressionData[0].rivalColor}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3, stroke: seasonProgressionData[0].rivalColor, strokeWidth: 1.5, fill: '#050505' }}
                          activeDot={{ r: 5, stroke: seasonProgressionData[0].rivalColor, strokeWidth: 2, fill: '#ffffff' }}
                          name={seasonProgressionData[0].rivalTeamName}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Resultados Detalhados das Corridas */}
            <div id="gp_detailed_results_section" className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#222] pb-4">
                <div className="flex items-center space-x-2.5">
                  <Flag className="h-5 w-5 text-[#FF1801]" />
                  <h3 className="font-display font-medium text-white text-sm uppercase tracking-wider">
                    🏁 Resultados por Grande Prêmio & Pódios ({simulationResult.raceResults.length} Corridas)
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-gray-400 uppercase mt-1 sm:mt-0">
                  Clique para conferir a classificação completa de 1º a 12º
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {simulationResult.raceResults.map((race: any, idx: number) => {
                  const circuitInfo = CIRCUITS.find(c => c.name === race.raceName);
                  const isExpanded = !!expandedGps[idx];
                  
                  // Extract podium spots
                  const p1 = race.podium[0];
                  const p2 = race.podium[1];
                  const p3 = race.podium[2];

                  return (
                    <div
                      key={idx}
                      className="bg-[#050505] border border-[#1a1a1a] rounded p-3.5 flex flex-col justify-between hover:border-[#333] transition-colors"
                    >
                      {/* Top label */}
                      <div className="flex items-center justify-between border-b border-[#222]/60 pb-2 mb-2">
                        <span className="text-[9px] font-mono font-bold text-[#FF1801]">
                          ETAPA {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        {circuitInfo && (
                          <span className="text-[8px] font-mono text-gray-400 px-1.5 py-0.5 bg-black rounded border border-[#222]/40">
                            {circuitInfo.type === 'veloz' && '⚡ Velo'}
                            {circuitInfo.type === 'rua' && '🧱 Rua'}
                            {circuitInfo.type === 'técnico' && '⚙️ Tec'}
                            {circuitInfo.type === 'clássico' && '🏎️ Clássico'}
                            {circuitInfo.isWet ? ' 🌧️ Molhado' : ' ☀️ Seco'}
                          </span>
                        )}
                      </div>

                      {/* Header with name and country */}
                      <div className="mb-2">
                        <span className="block text-xs font-display font-bold text-white truncate max-w-[220px]" title={race.raceName}>
                          {race.raceName}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-sans">
                          {circuitInfo?.country || 'Internacional'}
                        </span>
                      </div>

                      {/* CSS 3D-Style Miniature Podium */}
                      <div className="flex items-end justify-center h-20 pt-2 border-b border-[#222]/80 pb-1.5 gap-1 font-mono text-[9px] select-none">
                        {/* P2 */}
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-gray-400 font-bold truncate max-w-[50px] text-center" title={p2?.driver || 'N/A'}>
                            {p2?.driver ? p2.driver.split(' ').pop() : (typeof p2 === 'string' ? p2.split(' ').pop() : '-')}
                          </span>
                          <span className="text-[7px] text-gray-500 truncate max-w-[45px] text-center">
                            {p2?.team ? p2.team.split(' ')[0] : '-'}
                          </span>
                          <div className="w-full bg-[#1A1A1A] border border-[#2a2a2a] rounded-t-sm h-8 mt-1 flex flex-col justify-center items-center text-gray-400">
                            <span className="font-extrabold text-[8px]">2º</span>
                          </div>
                        </div>

                        {/* P1 */}
                        <div className="flex flex-col items-center w-1/3">
                          <Trophy className="h-2.5 w-2.5 text-amber-500 animate-pulse mb-0.5" />
                          <span className="text-amber-400 font-bold truncate max-w-[52px] text-center" title={p1?.driver || 'N/A'}>
                            {p1?.driver ? p1.driver.split(' ').pop() : (typeof p1 === 'string' ? p1.split(' ').pop() : '-')}
                          </span>
                          <span className="text-[7px] text-amber-500/60 truncate max-w-[45px] text-center">
                            {p1?.team ? p1.team.split(' ')[0] : '-'}
                          </span>
                          <div className="w-full bg-gradient-to-t from-[#362703] to-[#916d03] border border-amber-600 rounded-t-sm h-12 mt-1 flex flex-col justify-center items-center text-amber-100 shadow-[0_0_8px_rgba(180,140,0,0.15)]">
                            <span className="font-extrabold text-[9px]">1º</span>
                          </div>
                        </div>

                        {/* P3 */}
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-amber-700 font-bold truncate max-w-[50px] text-center" title={p3?.driver || 'N/A'}>
                            {p3?.driver ? p3.driver.split(' ').pop() : (typeof p3 === 'string' ? p3.split(' ').pop() : '-')}
                          </span>
                          <span className="text-[7px] text-orange-950 truncate max-w-[45px] text-center">
                            {p3?.team ? p3.team.split(' ')[0] : '-'}
                          </span>
                          <div className="w-full bg-[#17100b] border border-[#302118] rounded-t-sm h-6 mt-1 flex flex-col justify-center items-center text-amber-800">
                            <span className="font-extrabold text-[8px]">3º</span>
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse Action */}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedGps(prev => ({
                              ...prev,
                              [idx]: !prev[idx]
                            }));
                            playBeep(600, 0.04);
                          }}
                          className={`w-full py-1.5 px-2 rounded-sm text-[10px] font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                            isExpanded 
                              ? 'bg-red-950/20 text-[#FF1801] border border-red-900/30 hover:bg-red-900/10' 
                              : 'bg-black hover:bg-[#111] text-gray-400 border border-[#222]/80'
                          }`}
                        >
                          <span>{isExpanded ? 'Ocultar Grid' : 'Ver Grid Completo'}</span>
                        </button>
                      </div>

                      {/* Expanded Grid list of 1 to 12 - Inline standard flow */}
                      {isExpanded && (
                        <div className="p-2.5 bg-black/95 border border-[#222] rounded mt-2.5 space-y-1.5 font-mono text-[9px] text-[#A0A0A0] max-h-56 overflow-y-auto animate-fade-in">
                          <div className="flex items-center justify-between border-b border-[#222] pb-1 mb-1 text-[8px] uppercase font-bold text-gray-500">
                            <span>Posição / Piloto</span>
                            <span>Pontos</span>
                          </div>
                          {race.positions.map((p: any, pIdx: number) => {
                            const isUserDrv = p.team === 'Seu Time';
                            return (
                              <div
                                key={`pos-${p.driver}-${p.team}-${pIdx}`}
                                className={`flex flex-col py-1.5 border-b border-black/30 last:border-0 ${
                                  isUserDrv 
                                    ? 'text-white font-bold bg-[#FF1801]/10 px-1 rounded-sm' 
                                    : ''
                                }`}
                              >
                                <div className="flex justify-between items-center bg-transparent">
                                  <span className="flex items-center space-x-1.5 truncate max-w-[170px]">
                                    <span className={`w-4 font-bold ${pIdx < 3 ? 'text-amber-500 font-mono' : 'text-gray-500'}`}>
                                      {pIdx + 1}
                                    </span>
                                    <span className="truncate" title={`${p.driver} (${p.team})`}>
                                      {p.driver} <span className="text-[7.5px] opacity-60 text-gray-400">({p.team})</span>
                                    </span>
                                  </span>
                                  
                                  <span className="shrink-0 font-bold">
                                    {p.dnf ? (
                                      <span className="text-[#FF1801] text-[7px] uppercase bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30" title={p.incident}>
                                        🚨 DNF
                                      </span>
                                    ) : (
                                      <span className={pIdx < 10 ? 'text-emerald-400 font-bold' : 'text-gray-600'}>
                                        +{p.points}p
                                      </span>
                                    )}
                                  </span>
                                </div>
                                {p.trackEffect && (
                                  <div className="text-[7.5px] text-gray-400 font-mono mt-0.5 ml-5 flex items-center space-x-1 leading-none">
                                    <span className="text-[#FF1801]/80 font-bold">»</span>
                                    <span>{p.trackEffect}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs de Nova Partida */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between">
              <button
                id="btn_back_home"
                onClick={() => setGameMode('home')}
                className="bg-[#222] hover:bg-[#333] border border-[#333] text-[#E0E0E0] font-display font-bold px-6 py-4 rounded active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 mr-2 inline" />
                <span>Voltar ao Menu Inicial</span>
              </button>

              <button
                id="btn_goto_duelo_results"
                onClick={() => {
                  setDuelPreviousMode('results');
                  setGameMode('duelo');
                  playBeep(523, 0.1);
                }}
                className="bg-[#111] hover:bg-[#1a1a1a] border border-cyan-500/20 hover:border-cyan-500 text-white font-display font-bold px-6 py-4 rounded active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer flex-1 text-center"
              >
                <Flame className="h-4 w-4 mr-2 inline text-cyan-400" />
                <span>Modo Duelo (Comparar)</span>
              </button>

              <button
                id="btn_restart_game_results"
                onClick={() => handleStartGame('normal')}
                className="bg-[#FF1801] hover:bg-red-700 text-white font-display font-bold px-8 py-4 rounded transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(255,24,1,0.4)] text-xs tracking-wider uppercase cursor-pointer"
              >
                <Play className="h-4 w-4 mr-2 inline fill-current" />
                <span>Jogar Novo Campeonato</span>
              </button>
            </div>

          </div>
        )}

        {/* ==================== 4.5 MODO DUELO ==================== */}
        {gameMode === 'duelo' && (
          <div id="screen_duelo" className="space-y-6 py-4 animate-fade-in">
            
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0A] border border-[#222] p-5 rounded-lg">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Paddock Telemetry Analyzer
                </span>
                <h2 className="text-2xl font-display font-medium text-white flex items-center">
                  <Flame className="h-6 w-6 mr-2 text-[#FF1801] inline fill-current animate-pulse" />
                  Modo Duelo <span className="text-[#888] font-light ml-2">| Frente a Frente</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Confronte atributos e verifique simulações de sobreposição técnica de dois grandes nomes do esporte.
                </p>
              </div>

              <button
                id="btn_back_from_duelo"
                onClick={() => {
                  setGameMode(duelPreviousMode);
                  playBeep(440, 0.05);
                }}
                className="bg-[#222] hover:bg-[#333] text-xs font-mono font-bold text-white px-5 py-3 rounded active:scale-95 transition-all uppercase cursor-pointer border border-[#333] flex items-center space-x-2"
              >
                <RotateCcw className="h-3.5 w-3.5 inline text-gray-400" />
                <span>Voltar ({duelPreviousMode === 'home' ? 'Menu' : 'Resultados'})</span>
              </button>
            </div>

            {/* Quick Presets row */}
            <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-lg space-y-2">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">CONFRONTOS HISTÓRICOS CLÁSSICOS (PRESETS DE TELEMETRIA):</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const senna = historicalDrivers.find(d => d.id === 'senna_1988');
                    const schumi = historicalDrivers.find(d => d.id === 'schumacher_2004');
                    if (senna) setDuelCompetitorA(senna);
                    if (schumi) setDuelCompetitorB(schumi);
                    playBeep(659, 0.05);
                  }}
                  className="bg-[#151515] hover:bg-[#202020] border border-[#2A2A2A] hover:border-[#FF1801]/50 text-gray-300 py-2.5 px-3 rounded text-left transition-all truncate block cursor-pointer"
                >
                  🇧🇷 Senna vs 🇩🇪 Schumacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ham = historicalDrivers.find(d => d.id === 'hamilton_2021');
                    const max = historicalDrivers.find(d => d.id === 'verstappen_2023');
                    if (ham) setDuelCompetitorA(ham);
                    if (max) setDuelCompetitorB(max);
                    playBeep(659, 0.05);
                  }}
                  className="bg-[#151515] hover:bg-[#202020] border border-[#2A2A2A] hover:border-cyan-400/50 text-gray-300 py-2.5 px-3 rounded text-left transition-all truncate block cursor-pointer"
                >
                  🇬🇧 Hamilton vs 🇳🇱 Verstappen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const alonso2005 = historicalDrivers.find(d => d.id_season === 'alonso_2005_2005');
                    const alonso2012 = historicalDrivers.find(d => d.id_season === 'alonso_2012_2012');
                    if (alonso2005) setDuelCompetitorA(alonso2005);
                    if (alonso2012) setDuelCompetitorB(alonso2012);
                    playBeep(659, 0.05);
                  }}
                  className="bg-[#151515] hover:bg-[#202020] border border-[#2A2A2A] hover:border-[#FFCC00]/50 text-gray-300 py-2.5 px-3 rounded text-left transition-all truncate block cursor-pointer"
                >
                  🇪🇸 Alonso 2005 vs 2012
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prost = historicalDrivers.find(d => d.id === 'prost_1988');
                    const senna = historicalDrivers.find(d => d.id === 'senna_1988');
                    if (prost) setDuelCompetitorA(prost);
                    if (senna) setDuelCompetitorB(senna);
                    playBeep(659, 0.05);
                  }}
                  className="bg-[#151515] hover:bg-[#202020] border border-[#2A2A2A] hover:border-white/50 text-gray-300 py-2.5 px-3 rounded text-left transition-all truncate block cursor-pointer"
                >
                  🇫🇷 Prost vs 🇧🇷 Senna 1988
                </button>
              </div>
            </div>

            {/* Duel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Selector Column */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Selector Competidor A */}
                <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-3">
                  <span className="text-[10px] font-mono text-[#FF1801] uppercase tracking-wider block font-bold">COMPETIDOR A (TELEMETRIA VERMELHA)</span>
                  <div className="relative">
                    <select
                      value={duelCompetitorA?.id_season || ''}
                      onChange={(e) => {
                        const found = selectableDriversList.find(d => d.id_season === e.target.value);
                        if (found) {
                          setDuelCompetitorA(found);
                          playBeep(440, 0.05);
                        }
                      }}
                      className="w-full bg-[#151515] text-white border border-[#2A2A2A] rounded p-2.5 text-xs font-mono focus:outline-none focus:border-[#FF1801] cursor-pointer"
                    >
                      {selectableDriversList.map((d) => (
                        <option key={`optA-${d.id_season}`} value={d.id_season}>
                          {d.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {duelCompetitorA && (
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between border-b border-[#1A1A1A] pb-1.5 font-bold">
                        <span className="text-white text-sm">{duelCompetitorA.name}</span>
                        <span className="text-[11px] text-gray-500 font-mono italic">
                          {duelCompetitorA.country}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed italic">
                        "{duelCompetitorA.description}"
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[10px] text-gray-400">
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">TÍTULOS:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorA.titles}</span>
                        </div>
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">VITÓRIAS:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorA.wins}</span>
                        </div>
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">PÓDIOS:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorA.podiums}</span>
                        </div>
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">POLES:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorA.poles || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector Competidor B */}
                <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">COMPETIDOR B (TELEMETRIA CIANO)</span>
                  <div className="relative">
                    <select
                      value={duelCompetitorB?.id_season || ''}
                      onChange={(e) => {
                        const found = selectableDriversList.find(d => d.id_season === e.target.value);
                        if (found) {
                          setDuelCompetitorB(found);
                          playBeep(480, 0.05);
                        }
                      }}
                      className="w-full bg-[#151515] text-white border border-[#2A2A2A] rounded p-2.5 text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {selectableDriversList.map((d) => (
                        <option key={`optB-${d.id_season}`} value={d.id_season}>
                          {d.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {duelCompetitorB && (
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between border-b border-[#1A1A1A] pb-1.5 font-bold">
                        <span className="text-white text-sm">{duelCompetitorB.name}</span>
                        <span className="text-[11px] text-gray-500 font-mono italic">
                          {duelCompetitorB.country}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed italic">
                        "{duelCompetitorB.description}"
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[10px] text-gray-400">
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">TÍTULOS:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorB.titles}</span>
                        </div>
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">VITÓRIAS:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorB.wins}</span>
                        </div>
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">PÓDIOS:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorB.podiums}</span>
                        </div>
                        <div className="bg-[#111] p-1.5 rounded">
                          <span className="text-[#64748b] block font-semibold">POLES:</span>
                          <span className="font-bold text-white text-xs">{duelCompetitorB.poles || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Center Column: Radar Chart */}
              <div className="lg:col-span-5 flex justify-center">
                {duelCompetitorA && duelCompetitorB ? (
                  <RadarChart
                    competitorA={duelCompetitorA}
                    competitorB={duelCompetitorB}
                    colorA="#FF1801"
                    colorB="#00E5FF"
                  />
                ) : (
                  <div className="p-12 text-center text-gray-505 font-mono text-xs">
                    Escolha dois competidores válidos para gerar a telemetria do duelo.
                  </div>
                )}
              </div>

              {/* Right Column: Head-to-Head Statistics & Metrics */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-4">
                  <div className="border-b border-[#222] pb-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider block">COMPARATIVO DE EFICIÊNCIA</span>
                    <span className="text-xs text-gray-400">Qual piloto lidera estatisticamente?</span>
                  </div>

                  {duelCompetitorA && duelCompetitorB && (
                    <div className="space-y-4 text-xs font-mono">
                      
                      {/* Metric Comparison */}
                      {[
                        { label: 'Ritmo Geral', key: 'pace', icon: '⚡' },
                        { label: 'Constância', key: 'consistency', icon: '📈' },
                        { label: 'Chuva', key: 'chuva', icon: '🌧️' },
                        { label: 'Agressividade', key: 'aggressiveness', icon: '🔥' },
                        { label: 'Confiabilidade', key: 'reliability', icon: '🛡️' }
                      ].map((item) => {
                        const valA = duelCompetitorA[item.key] || 70;
                        const valB = duelCompetitorB[item.key] || 70;
                        const diff = valA - valB;

                        return (
                          <div key={`compare-${item.key}`} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span>{item.icon} {item.label}</span>
                              <span className="font-bold">
                                {diff > 0 
                                  ? `+${diff} para Competidor A` 
                                  : diff < 0 
                                    ? `+${Math.abs(diff)} para Competidor B` 
                                    : 'Empate técnico'}
                              </span>
                            </div>
                            
                            <div className="h-2 w-full bg-[#111] rounded flex overflow-hidden">
                              <div 
                                style={{ width: `${(valA / (valA + valB)) * 100}%` }} 
                                className="bg-[#FF1801] h-full transition-all duration-300"
                              />
                              <div 
                                style={{ width: `${(valB / (valA + valB)) * 100}%` }} 
                                className="bg-cyan-400 h-full transition-all duration-300"
                              />
                            </div>
                            
                            <div className="flex justify-between text-[8px] text-gray-505 font-mono">
                              <span>A: {valA} pts</span>
                              <span>B: {valB} pts</span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Diagnostic conclusion */}
                      <div className="p-3 bg-[#111] rounded text-[10px] text-[#888] leading-relaxed border-l-2 border-cyan-400/55">
                        <strong className="text-gray-300 block mb-1">🔍 DIAGNÓSTICO DO DUELO:</strong>
                        {(() => {
                          const avgA = Math.round(((duelCompetitorA.pace || 0) + (duelCompetitorA.consistency || 0) + (duelCompetitorA.chuva || 0) + (duelCompetitorA.aggressiveness || 0) + (duelCompetitorA.reliability || 0)) / 5);
                          const avgB = Math.round(((duelCompetitorB.pace || 0) + (duelCompetitorB.consistency || 0) + (duelCompetitorB.chuva || 0) + (duelCompetitorB.aggressiveness || 0) + (duelCompetitorB.reliability || 0)) / 5);
                          
                          if (avgA > avgB) {
                            return `${duelCompetitorA.name} detém uma vantagem técnica média de ${avgA - avgB} pontos sobre ${duelCompetitorB.name}, apresentando-se mais completo no panorama integrado.`;
                          } else if (avgB > avgA) {
                            return `${duelCompetitorB.name} detém uma vantagem técnica média de ${avgB - avgA} pontos sobre ${duelCompetitorA.name}, destacando-se como escolha superior nas médias gerais.`;
                          } else {
                            return `Equilíbrio tático perfeito! ${duelCompetitorA.name} e ${duelCompetitorB.name} registram a mesma performance média integrada de ${avgA} pontos.`;
                          }
                        })()}
                      </div>

                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Live Grand Prix Duel Simulator (Pit Wall Telemetry & Track Animation) */}
            <div id="live_duel_simulation_tool" className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#222] pb-3 gap-2">
                <div className="flex items-center space-x-2.5">
                  <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                  <h3 className="font-display font-medium text-white text-sm uppercase tracking-wider">
                    🏆 Live Grand Prix Duel (Telemetria de Pit Wall)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest ${
                    isLiveDuelActive 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' 
                      : liveDuelFinished 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-neutral-800 text-gray-400'
                  }`}>
                    {isLiveDuelActive ? '● CORRIDA EM CURSO' : liveDuelFinished ? '🏁 CORRIDA FINALIZADA' : '🚦 AGUARDANDO LARGADA'}
                  </span>
                </div>
              </div>

              {/* Control Deck panel */}
              {duelCompetitorA && duelCompetitorB ? (
                <div className="space-y-4">
                  
                  {/* Action row with statistics overview */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#050505]/60 border border-[#1d1d1d] p-4 rounded-md">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-gray-450">
                      <div>
                        <span className="text-gray-500 mr-1.5 uppercase font-bold text-[10px]">Setor Atual:</span>
                        <span className="text-white font-bold uppercase bg-[#151515] px-2 py-0.5 rounded border border-[#222]">
                          {liveSector === 'Chuva' && '🌧️ Chuva'}
                          {liveSector === 'Reta' && '🏎️ Reta Principal'}
                          {liveSector === 'Curva' && '📐 Chicane'}
                          {liveSector === 'S' && '🔄 S do Senna'}
                          {liveSector === 'Mista' && '⚡ Setor Misto'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 mr-1.5 uppercase font-bold text-[10px]">Volta:</span>
                        <span className="text-cyan-400 font-bold font-mono">
                          {isLiveDuelActive || liveDuelFinished ? `${liveDuelLap} / 10` : '0 / 10'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 mr-1.5 uppercase font-bold text-[10px]">Estresse Ativo:</span>
                        <span className="text-amber-500 font-bold font-mono">
                          {dnfStressMultiplier}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isLiveDuelActive ? (
                        <button
                          type="button"
                          onClick={handleStopLiveDuel}
                          className="bg-red-955/40 hover:bg-red-900 border border-red-700/60 text-red-100 font-display font-bold px-5 py-2.5 rounded text-xs tracking-wider uppercase cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5"
                        >
                          <span>🛑 Abortar Telemetria</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartLiveDuel}
                          className={`font-display font-bold px-6 py-2.5 rounded text-xs tracking-wider uppercase cursor-pointer active:scale-95 transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(255,24,1,0.15)] ${
                            liveDuelFinished
                              ? 'bg-amber-600 hover:bg-amber-700 text-black shadow-[0_0_15px_rgba(217,119,6,0.25)]'
                              : 'bg-[#FF1801] hover:bg-red-700 text-white'
                          }`}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{liveDuelFinished ? '🔄 Replay Corrida' : '🚀 Iniciar Corrida Live'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stylized Speedway Animation Track */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1 text-[9px] font-mono text-gray-500 uppercase font-bold">
                      <span>🏁 Pista de Interlagos (Esquema Integrado)</span>
                      {liveDuelWinner && (
                        <span className="text-yellow-400 animate-pulse">
                          🏆 Vencedor: {liveDuelWinner}
                        </span>
                      )}
                    </div>

                    <div className="relative h-20 bg-[#050505] rounded-md border border-[#1a1a1a] overflow-hidden shadow-inner">
                      {/* Grid overlay for a high tech look */}
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#151515] border-t border-dashed border-[#222]" />
                      
                      {/* Checkpoint markings */}
                      <div className="absolute inset-0 flex justify-between px-3 text-[7px] font-mono text-gray-600 select-none items-center h-full pointer-events-none">
                        <span>[GRID LARGADA]</span>
                        <span>[S DO SENNA]</span>
                        <span>[RETA OPOS]</span>
                        <span>[LAGO]</span>
                        <span>[PINHEIRINHO]</span>
                        <span>[MERGULHO]</span>
                        <span className="text-gray-500">🏁 [CHEGADA]</span>
                      </div>

                      {/* Lane 1 (A) - Red */}
                      <div className="absolute top-[8%] left-0 w-full h-[38%] flex items-center pr-10">
                        {(() => {
                          const scoreA = liveStatsA.score;
                          const posA = liveStatsA.status === '💥 DNF' 
                            ? Math.min(95, Math.max(2, (scoreA / 2700) * 100))
                            : isLiveDuelActive || liveDuelFinished
                              ? Math.min(95, Math.max(2, (scoreA / 2700) * 100))
                              : 2;

                          return (
                            <div 
                              style={{ left: `${posA}%` }} 
                              className="absolute flex items-center space-x-1.5 transition-all duration-700 ease-out"
                            >
                              <div className="relative group">
                                <div className={`absolute -inset-1 rounded-full bg-[#FF1801]/35 blur-[2px] ${isLiveDuelActive ? 'animate-pulse' : ''}`} />
                                <div className={`relative h-5 w-5 rounded-full flex items-center justify-center border text-[9px] font-bold shadow-md transition-all ${
                                  liveStatsA.status === '💥 DNF'
                                    ? 'bg-red-950/90 border-[#FF1801] text-[#FF1801]'
                                    : liveStatsA.status === '🏆 VENCEDOR'
                                      ? 'bg-yellow-500 border-yellow-300 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                                      : 'bg-[#FF1801] border-red-400 text-white'
                                }`}>
                                  {liveStatsA.status === '💥 DNF' ? '💥' : '🔴'}
                                </div>
                              </div>
                              <span className="text-[7.5px] font-bold text-[#FF1801] font-mono bg-black/80 px-1 py-0.5 rounded border border-red-900/30 whitespace-nowrap">
                                {duelCompetitorA.name.split(' ')[1] || 'A'} {liveStatsA.speed > 0 ? `(${liveStatsA.speed} km/h)` : ''}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Lane 2 (B) - Cyan */}
                      <div className="absolute bottom-[8%] left-0 w-full h-[38%] flex items-center pr-10">
                        {(() => {
                          const scoreB = liveStatsB.score;
                          const posB = liveStatsB.status === '💥 DNF' 
                            ? Math.min(95, Math.max(2, (scoreB / 2700) * 100))
                            : isLiveDuelActive || liveDuelFinished
                              ? Math.min(95, Math.max(2, (scoreB / 2700) * 100))
                              : 2;

                          return (
                            <div 
                              style={{ left: `${posB}%` }} 
                              className="absolute flex items-center space-x-1.5 transition-all duration-700 ease-out"
                            >
                              <div className="relative group">
                                <div className={`absolute -inset-1 rounded-full bg-cyan-400/35 blur-[2px] ${isLiveDuelActive ? 'animate-pulse' : ''}`} />
                                <div className={`relative h-5 w-5 rounded-full flex items-center justify-center border text-[9px] font-bold shadow-md transition-all ${
                                  liveStatsB.status === '💥 DNF'
                                    ? 'bg-slate-900/90 border-cyan-400 text-cyan-400'
                                    : liveStatsB.status === '🏆 VENCEDOR'
                                      ? 'bg-yellow-500 border-yellow-300 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                                      : 'bg-cyan-500 border-cyan-400 text-black'
                                }`}>
                                  {liveStatsB.status === '💥 DNF' ? '💥' : '🔵'}
                                </div>
                              </div>
                              <span className="text-[7.5px] font-bold text-cyan-400 font-mono bg-black/80 px-1 py-0.5 rounded border border-cyan-900/40 whitespace-nowrap">
                                {duelCompetitorB.name.split(' ')[1] || 'B'} {liveStatsB.speed > 0 ? `(${liveStatsB.speed} km/h)` : ''}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Dual Telemetry Monitors and Terminal Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Monitor A */}
                    <div className="md:col-span-4 bg-[#050505] border border-red-950/45 rounded p-3.5 space-y-3 relative overflow-hidden shadow-inner">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-[#FF1801]" />
                      <div className="flex justify-between items-center border-b border-[#151515] pb-1.5">
                        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wide truncate max-w-[140px]">
                          {duelCompetitorA.name}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          liveStatsA.status === '💥 DNF'
                            ? 'bg-red-955 text-[#FF1801] border border-red-900/50'
                            : liveStatsA.status === '🏆 VENCEDOR'
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                              : liveStatsA.status === 'ATIVO'
                                ? 'bg-[#FF1801]/10 text-[#FF1801] border border-[#FF1801]/20'
                                : 'bg-neutral-900 text-gray-500'
                        }`}>
                          {liveStatsA.status}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs font-mono">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] text-gray-500">VELOCIDADE:</span>
                          <span className="text-sm font-bold text-white font-mono">{liveStatsA.speed} km/h</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (liveStatsA.speed / 360) * 100)}%` }}
                            className="bg-[#FF1801] h-full transition-all duration-300" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-[8px] text-gray-500 block">ACELERADOR:</span>
                            <span className="text-white font-bold">{liveStatsA.throttle}%</span>
                            <div className="h-1 bg-[#111] rounded-full overflow-hidden mt-1">
                              <div style={{ width: `${liveStatsA.throttle}%` }} className="bg-emerald-500 h-full" />
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">FREIO:</span>
                            <span className="text-white font-bold">{liveStatsA.brake}%</span>
                            <div className="h-1 bg-[#111] rounded-full overflow-hidden mt-1">
                              <div style={{ width: `${liveStatsA.brake}%` }} className="bg-red-500 h-full" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-500">TEMP MOTOR:</span>
                          <span className={`font-bold font-mono ${liveStatsA.temp > 115 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                            {liveStatsA.temp}°C {liveStatsA.temp > 115 && '🔥 CRIT'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Monitor B */}
                    <div className="md:col-span-4 bg-[#050505] border border-cyan-950/45 rounded p-3.5 space-y-3 relative overflow-hidden shadow-inner">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400" />
                      <div className="flex justify-between items-center border-b border-[#151515] pb-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wide truncate max-w-[140px]">
                          {duelCompetitorB.name}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          liveStatsB.status === '💥 DNF'
                            ? 'bg-red-955 text-[#FF1801] border border-red-900/50'
                            : liveStatsB.status === '🏆 VENCEDOR'
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                              : liveStatsB.status === 'ATIVO'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-neutral-900 text-gray-500'
                        }`}>
                          {liveStatsB.status}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs font-mono">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] text-gray-500">VELOCIDADE:</span>
                          <span className="text-sm font-bold text-white font-mono">{liveStatsB.speed} km/h</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (liveStatsB.speed / 360) * 100)}%` }}
                            className="bg-cyan-400 h-full transition-all duration-300" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-[8px] text-gray-500 block">ACELERADOR:</span>
                            <span className="text-white font-bold">{liveStatsB.throttle}%</span>
                            <div className="h-1 bg-[#111] rounded-full overflow-hidden mt-1">
                              <div style={{ width: `${liveStatsB.throttle}%` }} className="bg-emerald-500 h-full" />
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">FREIO:</span>
                            <span className="text-white font-bold">{liveStatsB.brake}%</span>
                            <div className="h-1 bg-[#111] rounded-full overflow-hidden mt-1">
                              <div style={{ width: `${liveStatsB.brake}%` }} className="bg-red-500 h-full" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-500">TEMP MOTOR:</span>
                          <span className={`font-bold font-mono ${liveStatsB.temp > 115 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                            {liveStatsB.temp}°C {liveStatsB.temp > 115 && '🔥 CRIT'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Terminal Scroll Log */}
                    <div className="md:col-span-4 bg-black border border-[#222]/80 rounded p-3 relative shadow-inner flex flex-col h-[142px]">
                      <div className="flex items-center space-x-1.5 text-[8.5px] font-mono text-gray-500 border-b border-[#111] pb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="uppercase font-bold">RACE CONTROL FEED (LIVE LOG)</span>
                      </div>
                      <div className="flex-1 overflow-y-auto font-mono text-[9px] text-gray-300 pt-2 space-y-1.5 scrollbar-thin select-none">
                        {liveDuelLogs.map((log, idx) => {
                          let colorClass = 'text-gray-400';
                          if (log.includes('🏆') || log.includes('VENCEDOR')) colorClass = 'text-yellow-400 font-bold';
                          else if (log.includes('💥') || log.includes('🚨')) colorClass = 'text-red-400 font-bold';
                          else if (log.includes('🌧️')) colorClass = 'text-cyan-400';
                          else if (log.includes('🏁')) colorClass = 'text-white font-semibold';
                          else if (log.includes('🚥') || log.includes('SINAL VERDE')) colorClass = 'text-emerald-400 font-bold';

                          return (
                            <div key={`log-${idx}`} className={`leading-normal ${colorClass}`}>
                              {log}
                            </div>
                          );
                        })}
                        {liveDuelLogs.length === 0 && (
                          <div className="text-gray-600 italic text-center text-[8.5px] py-4">
                            Pressione 'Iniciar Corrida Live' para acionar os bólidos.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="p-5 text-center text-[#777] font-mono text-xs italic">
                  Escolha ambos os competidores para carregar o Pit Wall Virtual.
                </div>
              )}
            </div>

            {/* DNF Core Tool Module */}
            <div id="dnf_simulation_tool" className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3">
                <AlertTriangle className="h-5 w-5 text-[#FF1801] animate-pulse" />
                <h3 className="font-display font-medium text-white text-sm uppercase tracking-wider">🔧 DNF Telemetry Analyzer & Stress Simulator</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">🎡 Multiplicador de Estresse:</span>
                    <label className="inline-flex items-center space-x-2 cursor-pointer text-[10px] font-mono text-gray-400 select-none">
                      <input 
                        type="checkbox"
                        checked={autoScaleStress}
                        onChange={(e) => {
                          setAutoScaleStress(e.target.checked);
                          playBeep(440, 0.05);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-[#151515] rounded-full peer peer-checked:bg-[#FF1801]/20 border border-[#222] relative transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 peer-checked:after:bg-[#FF1801] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3" />
                      <span className="font-bold uppercase tracking-wider text-[8px] transition-colors peer-checked:text-[#FF1801]">Auto Justo</span>
                    </label>
                  </div>
                  
                  <div className="space-y-1">
                    <input 
                      type="range" 
                      min="20" 
                      max="200" 
                      value={dnfStressMultiplier} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDnfStressMultiplier(val);
                        setAutoScaleStress(false); // Disables auto-balance when adjusted manually
                        playBeep(350 + val, 0.03);
                      }}
                      className="w-full accent-red-600 cursor-pointer h-1 bg-[#151515] rounded" 
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>Mínimo (20%)</span>
                      <span className={`font-bold font-mono transition-colors ${autoScaleStress ? 'text-[#FF1801] animate-pulse' : 'text-gray-300'}`}>
                        {dnfStressMultiplier}% Stress {autoScaleStress && '(Auto)'}
                      </span>
                      <span>Máximo (200%)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                    {autoScaleStress ? (
                      <span className="text-amber-500/90 font-mono text-[9px] block">
                        ⚡ Calibração ativa! Estresse nivelado para atingir um risco médio ideal de incidentes com base nas taxas de quebras.
                      </span>
                    ) : (
                      "Ajuste o desgaste mecânico e térmico. Valores elevados amplificam as chances de incidentes mecânicos severos (Pane Elétrica, estouro pneumático, DNF) com base na agressividade e confiabilidade de cada piloto."
                    )}
                  </p>
                </div>

                <div className="md:col-span-5 border-l border-[#222]/80 pl-0 md:pl-6 space-y-2.5">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block font-bold">📊 Probabilidade Instantânea de DNF:</span>
                  {duelCompetitorA && duelCompetitorB ? (
                    <div className="space-y-3 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-red-400 truncate max-w-[170px]">{duelCompetitorA.name}</span>
                          <span className="text-gray-400">Risco: {Math.min(99, Math.round(((100 - (duelCompetitorA.reliability || 90)) * 0.18 + (duelCompetitorA.aggressiveness || 80) * 0.05) * (dnfStressMultiplier / 100) * 1.5))}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111] rounded overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, Math.round(((100 - (duelCompetitorA.reliability || 90)) * 0.18 + (duelCompetitorA.aggressiveness || 80) * 0.05) * (dnfStressMultiplier / 100) * 1.5))}%` }}
                            className="bg-[#FF1801] h-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-cyan-400 truncate max-w-[170px]">{duelCompetitorB.name}</span>
                          <span className="text-gray-400">Risco: {Math.min(99, Math.round(((100 - (duelCompetitorB.reliability || 90)) * 0.18 + (duelCompetitorB.aggressiveness || 80) * 0.05) * (dnfStressMultiplier / 100) * 1.5))}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111] rounded overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, Math.round(((100 - (duelCompetitorB.reliability || 90)) * 0.18 + (duelCompetitorB.aggressiveness || 80) * 0.05) * (dnfStressMultiplier / 100) * 1.5))}%` }}
                            className="bg-cyan-400 h-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono">Selecione dois competidores para carregar estatísticas.</span>
                  )}
                </div>

                <div className="md:col-span-3 text-center md:border-l md:border-[#222]/80 md:pl-6 space-y-2">
                  <button
                    type="button"
                    onClick={handleSimulateIncidentDuel}
                    className="w-full bg-[#FF1801] hover:bg-red-700 text-white py-3 px-4 rounded font-display text-[11px] font-bold tracking-wider uppercase active:scale-95 transition-all text-center cursor-pointer shadow-[0_0_15px_rgba(255,24,1,0.2)]"
                  >
                    🚀 Stress Test DNF
                  </button>
                  <span className="text-[8px] text-gray-500 font-mono block uppercase">Análise Física Realtime</span>
                </div>
              </div>

              {dnfDuelResult && (
                <div className="p-4 bg-black border border-red-900/30 rounded mt-2 text-xs font-mono space-y-2 animate-zoom-in">
                  <div className="flex items-center space-x-2 text-[10px] text-amber-500 font-bold uppercase">
                    <span>⚡ LAUDO TÉCNICO DE PISTA:</span>
                    <span className="text-gray-500">| Stress de Pista a {dnfStressMultiplier}%</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic">
                    {dnfDuelResult}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* ==================== 5. MODAL DE REGRAS & COMO JOGAR ==================== */}
      {rulesModalOpen && (
        <div id="rules_modal" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e1420] border border-[#20293a] rounded-xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative animate-zoom-in">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-red-500" />
                <h4 className="font-display font-bold text-white text-lg">Como Funciona o 7a0 Fórmula 1?</h4>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed overflow-y-auto max-h-[60vh] pr-1">
              <p>
                Este é um simulador estratégico com draft sequencial. Seu desafio é recrutar passo a passo 10 elementos que compõem sua escuderia para disputar o Mundial contra 5 esquadrões lendários compostos pelas supermarcas da F1 (Ferrari 2004 de Schumacher, McLaren 1988 de Senna, Red Bull 2023 de Verstappen, Mercedes 2021 de Hamilton, e Williams 1992 de Mansell).
              </p>

              <div className="space-y-2">
                <span className="font-bold text-white block uppercase">⚡ OS 10 SLOTS ESSENCIAIS:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Piloto Titular 1 & 2:</strong> Líderes de pista. Marcam a maior fatia de ritmo e pontos.</li>
                  <li><strong>Reservas & Histórico:</strong> Multiplicadores técnicos estáveis que previnem azares e incrementam o desenvolvimento.</li>
                  <li><strong>Especialista em Chuva:</strong> Dá bônus gigante em GPs de chuva como o Brasil!</li>
                  <li><strong>Coringa / Chefe:</strong> Comandantes políticos e mentores.</li>
                  <li><strong>Carro / Chassi:</strong> Base mecânica do motor, velocidade de reta e downforce.</li>
                  <li><strong>Estrategista & Engenheiro:</strong> O cérebro tecnológico na mureta e as ideias de túnel de vento.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block uppercase">🎲 O SISTEMA DE SORTEIO E CORINGA:</span>
                <p>
                  A cada round, o jogo sorteia aleatoriamente um combinado de <strong>Temporada e Escuderia Histórica</strong>. Você só pode contratar os profissionais que pertenceram àquele esquadrão naquela exata época! Não gostou do sorteio? Você tem <strong>1 Coringa de Reroll por partida</strong> para mudar as escolhas.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block uppercase">🏁 A SIMULAÇÃO DA CORRIDA:</span>
                <p>
                  Os desfechos das 8 corridas do ano não são fakes. Uma sólida engine lógica roda levando em consideração o Ritmo (Pace) do piloto sorteado, Confiabilidade mecânica do carro de base, força de Engenharia e Estratégia de Box contra o clima instável dos circuitos. Batidas e quebras (DNFs) ocorrem caso monte uma equipe instável ou agressiva demais!
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <button
                id="btn_close_rules"
                onClick={() => setRulesModalOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-display font-medium text-xs px-6 py-2.5 rounded transition-all"
              >
                ENTENDIDO, VOLTAR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== CONFIRMAÇÃO DE SUPPORT/BUFF CARD POPUP ==================== */}
      {activeBuffModals && selectedCardToUse && (
        <div id="buff_card_modal" className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#0B0B0B] border border-amber-500/30 rounded-lg p-6 max-w-md w-full space-y-5 text-left shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
            <div className="absolute top-0 right-0 p-3 text-[9px] text-amber-500 font-mono font-bold tracking-widest">TRANSMISSÃO DE RÁDIO MURETA</div>
            
            <div className="flex gap-3.5 items-start">
              <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF1801] font-bold">Injeção Inteligente de Telemetria</span>
                <h3 className="text-lg font-display font-bold text-white leading-tight mt-0.5">{selectedCardToUse.name}</h3>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-sans">
              {selectedCardToUse.description}
            </div>

            <div className="text-xs text-amber-300 bg-amber-950/30 p-3 rounded border border-amber-500/20 font-mono">
              📌 Alvo corrente: <strong className="text-white uppercase">GP {CIRCUITS[simActiveRaceIdx]?.name?.replace('Grande Prêmio ', ' ') || "Corrida ativa"}</strong>
            </div>

            <p className="text-[11px] text-[#888] font-sans leading-normal">
              Esta ação consumirá o card permanentemente pela duração do campeonato atual, recalculando instantaneamente os tempos e a classificação de pilotos deste GP para impulsionar seu time!
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setSelectedCardToUse(null);
                  setActiveBuffModals(false);
                  playBeep(330, 0.1);
                }}
                className="px-5 py-2.5 rounded text-xs font-display font-semibold border border-neutral-800 text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all uppercase cursor-pointer tracking-wider"
              >
                Cancelar
              </button>
              <button
                id="btn_confirm_buff_activation"
                onClick={() => handleApplyCard(selectedCardToUse.id)}
                className="px-6 py-2.5 rounded text-xs font-display font-bold bg-[#FF1801] hover:bg-red-700 text-white active:scale-95 transition-all shadow-[0_0_15px_rgba(255,24,1,0.3)] uppercase cursor-pointer tracking-widest"
              >
                Confirmar Ativação 🏁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer id="footer" className="bg-[#090d16] border-t border-[#161d2d] py-4 text-center">
        <span className="text-[10px] text-gray-500 font-mono tracking-wider">
          7A0 FORMULA 1 • DESENVOLVIDO EM PORTUGUÊS DE SESSÃO CASUAL
        </span>
      </footer>

    </div>
  );
}
