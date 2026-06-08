/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  UserCheck,
  Frown,
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
  Pause,
  FastForward,
  Gauge,
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
import TEAMS_META from './data/teams_meta.json';
import DRIVERS_META from './data/drivers_meta.json';
import ENGINEERS_META from './data/engineers_meta.json';
import ENGINES_META from './data/engines_meta.json';
import { runChampionshipSimulation, RIVAL_DRIVERS, DriverEntry } from './simulation';
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
    // Sort items by points descending so the leader of the GP step is at the top
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-[#050505]/95 backdrop-blur border border-[#333] p-2.5 rounded shadow-2xl font-mono text-[9px] space-y-1 max-h-72 overflow-y-auto min-w-[160px]">
        <p className="text-gray-400 font-bold border-b border-[#222] pb-1 mb-1">{label}</p>
        <div className="space-y-1">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2.5 justify-between gap-1">
              <span className="flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.stroke || entry.color }} />
                <span className="text-gray-300 truncate max-w-[100px]">{entry.name}</span>
              </span>
              <span className="font-bold text-white shrink-0">{entry.value} pts</span>
            </div>
          ))}
        </div>
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
  const [difficultyMode, setDifficultyMode] = useState<'normal' | 'hard' | 'underdog'>(() => {
    return (localStorage.getItem('f1_difficulty_mode') as any) || 'normal';
  });
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(() => {
    return Number(localStorage.getItem('f1_active_slot_index') || '0');
  });
  const [slots, setSlots] = useState<Record<string, any>>(() => {
    try {
      return JSON.parse(localStorage.getItem('f1_slots') || '{}');
    } catch {
      return {};
    }
  });
  const [jokerAvailable, setJokerAvailable] = useState<boolean>(() => {
    return localStorage.getItem('f1_joker_available') !== 'false';
  });
  const [activeCombo, setActiveCombo] = useState<TeamCombination | null>(() => {
    try {
      const saved = localStorage.getItem('f1_active_combo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [restrictiveMode, setRestrictiveMode] = useState<'none' | 'elite' | 'no-meme' | 'only-meme'>(() => {
    return (localStorage.getItem('f1_restrictive_mode') as any) || 'none';
  });
  const [bankruptcyModalOpen, setBankruptcyModalOpen] = useState<boolean>(false);
  const [bankruptcyDetails, setBankruptcyDetails] = useState<{ teamName: string; position: number; points: number; isMultiplayer: boolean; playerList?: string[]; failedStaff?: any } | null>(null);
  const [historyEncyclopediaOpen, setHistoryEncyclopediaOpen] = useState<boolean>(false);
  const [activeEncyclopediaTab, setActiveEncyclopediaTab] = useState<'teams' | 'drivers' | 'engineers'>('teams');
  const [encyclopediaSearch, setEncyclopediaSearch] = useState<string>('');

  // Custom singleplayer team name and color customization
  const [playerTeamName, setPlayerTeamName] = useState<string>(() => {
    return sessionStorage.getItem('f1_player_team_name') || 'Massa GP';
  });
  const [playerTeamColor, setPlayerTeamColor] = useState<string>(() => {
    return sessionStorage.getItem('f1_player_team_color') || '#FF1801';
  });
  const [isTeamNameInputFocused, setIsTeamNameInputFocused] = useState<boolean>(false);

  // Multiplayer championship states (2 to 4 simultaneous players)
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(() => {
    return localStorage.getItem('f1_is_multiplayer') === 'true';
  });
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('f1_multiplayer_players') || '[]');
    } catch {
      return [];
    }
  });
  const [activeMultiPlayerIndex, setActiveMultiPlayerIndex] = useState<number>(() => {
    return Number(localStorage.getItem('f1_active_multiplayer_index') || '0');
  });
  const [multiSetupOpen, setMultiSetupOpen] = useState<boolean>(false);
  const [multiplayerCount, setMultiplayerCount] = useState<number>(() => {
    return Number(localStorage.getItem('f1_multiplayer_count') || '4');
  });
  const [tempPlayerConfigs, setTempPlayerConfigs] = useState<any[]>([
    { name: 'Jogador 1', teamName: 'Alpha Racing', color: '#FF1100' },
    { name: 'Jogador 2', teamName: 'Apex Precision', color: '#00BBEF' },
    { name: 'Jogador 3', teamName: 'Monza Power', color: '#EAB308' },
    { name: 'Jogador 4', teamName: 'Samba Speed', color: '#00BB44' },
  ]);

  // Results page inspector sub-index
  const [activeResultsPlayerIndex, setActiveResultsPlayerIndex] = useState<number>(0);

  // Helper slice for setup
  const multiplayerplayerConfigsSlice = () => {
    return tempPlayerConfigs.slice(0, multiplayerCount);
  };

  // Helper verify whether a team belongs to a player
  const isTeamUser = (tName: string) => {
    if (isMultiplayer) {
      return multiplayerPlayers.some(p => p.teamName === tName);
    }
    return tName === playerTeamName;
  };

  // Helper matching team name to color
  const getTeamColor = (tName: string) => {
    if (isMultiplayer) {
      const pl = multiplayerPlayers.find(p => p.teamName === tName);
      return pl ? pl.color : '#94A3B8';
    }
    return tName === playerTeamName ? playerTeamColor : '#94A3B8';
  };

  // Recount active player index switches
  const setActivePlayer = (targetIdx: number) => {
    setActiveMultiPlayerIndex(targetIdx);
    const targetPlayer = multiplayerPlayers[targetIdx];
    if (targetPlayer) {
      const unfilledIdx = GAME_SLOTS.findIndex(s => !targetPlayer.slots[s.id]);
      const nextSlotIdx = unfilledIdx !== -1 ? unfilledIdx : 0;
      setActiveSlotIndex(nextSlotIdx);
      setSlots(targetPlayer.slots);
      setJokerAvailable(targetPlayer.jokerAvailable);
      setActiveCombo(targetPlayer.activeCombo);
      if (targetPlayer.activeCombo) {
        generateCandidatesForSlot(GAME_SLOTS[nextSlotIdx], targetPlayer.activeCombo, targetPlayer.slots);
      }
    }
  };

  // Buff cards states
  const [availableCards, setAvailableCards] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('f1_available_cards') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedCardToUse, setSelectedCardToUse] = useState<any | null>(null);
  const [activeBuffModals, setActiveBuffModals] = useState<boolean>(false);
  const [buffHistory, setBuffHistory] = useState<string[]>([]);
  const [targetPlayerIdx, setTargetPlayerIdx] = useState<number>(0);

  // 2-Phase Live Championship Simulator States
  const [simGpIdx, setSimGpIdx] = useState<number>(() => {
    return Number(localStorage.getItem('f1_sim_gp_idx') || '0');
  });
  const [simPhase, setSimPhase] = useState<'intro' | 'strategy' | 'quali' | 'finished_quali' | 'race_lights' | 'race' | 'finished_race'>(() => {
    return (localStorage.getItem('f1_sim_phase') as any) || 'intro';
  });
  const [multiplayerStrategies, setMultiplayerStrategies] = useState<Record<number, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('f1_multiplayer_strategies') || '{}');
    } catch {
      return {};
    }
  });
  const [multiplayerCards, setMultiplayerCards] = useState<Record<number, { cardId: string; racesLeft: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('f1_multiplayer_cards') || '{}');
    } catch {
      return {};
    }
  });
  const [marioKartMode, setMarioKartMode] = useState<boolean>(false);
  const [simIsPlaying, setSimIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simQualiLeaderboard, setSimQualiLeaderboard] = useState<any[]>([]);
  const [simQualiActiveDriverIndex, setSimQualiActiveDriverIndex] = useState<number>(0);
  const [simQualiActiveDriverDelta, setSimQualiActiveDriverDelta] = useState<any>(null);
  const [simRaceLap, setSimRaceLap] = useState<number>(0);
  const [simRaceLeaderboard, setSimRaceLeaderboard] = useState<any[]>([]);
  const [simTickerLogs, setSimTickerLogs] = useState<string[]>([]);
  const [simTelemetryValues, setSimTelemetryValues] = useState<Record<string, { speed: number; gear: number; rpm: number; throttle: number; brake: number; drs: boolean; temp: number }>>({});
  const [simYellowFlag, setSimYellowFlag] = useState<boolean>(false);
  const [simYellowFlagMessage, setSimYellowFlagMessage] = useState<string>('');

  const [gameMode, setGameMode] = useState<'home' | 'draft' | 'simulating' | 'results' | 'duelo'>(() => {
    return (localStorage.getItem('f1_game_mode') as any) || 'home';
  });
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
    if (userReserve1) {
      list.push({
        ...userReserve1,
        id_season: 'user_reserve_1',
        sourceTeam: 'Sua Equipe (Reserva)',
        sourceSeason: 'Atual',
        displayName: `⭐ ${userReserve1.name} (Seu Reserva)`
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
  const [simulationResult, setSimulationResult] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('f1_simulation_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [simActiveRaceIdx, setSimActiveRaceIdx] = useState<number>(() => {
    return Number(localStorage.getItem('f1_sim_active_race_idx') || '-1');
  });
  const [simLightsCount, setSimLightsCount] = useState<number>(0);
  const [simRaceCompleted, setSimRaceCompleted] = useState<boolean>(() => {
    return localStorage.getItem('f1_sim_race_completed') === 'true';
  });

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

  // Synchronize game states to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('f1_game_mode', gameMode);
      localStorage.setItem('f1_slots', JSON.stringify(slots));
      localStorage.setItem('f1_active_slot_index', String(activeSlotIndex));
      localStorage.setItem('f1_active_combo', activeCombo ? JSON.stringify(activeCombo) : '');
      localStorage.setItem('f1_difficulty_mode', difficultyMode);
      localStorage.setItem('f1_restrictive_mode', restrictiveMode);
      localStorage.setItem('f1_is_multiplayer', String(isMultiplayer));
      localStorage.setItem('f1_multiplayer_players', JSON.stringify(multiplayerPlayers));
      localStorage.setItem('f1_active_multiplayer_index', String(activeMultiPlayerIndex));
      localStorage.setItem('f1_multiplayer_count', String(multiplayerCount));
      localStorage.setItem('f1_simulation_result', simulationResult ? JSON.stringify(simulationResult) : '');
      localStorage.setItem('f1_sim_gp_idx', String(simGpIdx));
      localStorage.setItem('f1_sim_phase', simPhase);
      localStorage.setItem('f1_sim_active_race_idx', String(simActiveRaceIdx));
      localStorage.setItem('f1_sim_race_lap', String(simRaceLap));
      localStorage.setItem('f1_sim_race_completed', String(simRaceCompleted));
      localStorage.setItem('f1_available_cards', JSON.stringify(availableCards));
      localStorage.setItem('f1_multiplayer_strategies', JSON.stringify(multiplayerStrategies));
      localStorage.setItem('f1_multiplayer_cards', JSON.stringify(multiplayerCards));
      localStorage.setItem('f1_joker_available', String(jokerAvailable));
    } catch (e) {
      console.error('Erro ao syncreizar f1_game_state no localStorage:', e);
    }
  }, [
    gameMode,
    slots,
    activeSlotIndex,
    activeCombo,
    difficultyMode,
    restrictiveMode,
    isMultiplayer,
    multiplayerPlayers,
    activeMultiPlayerIndex,
    multiplayerCount,
    simulationResult,
    simGpIdx,
    simPhase,
    simActiveRaceIdx,
    simRaceLap,
    simRaceCompleted,
    availableCards,
    multiplayerStrategies,
    multiplayerCards,
    jokerAvailable
  ]);

  // Restore active draft candidates on refresh
  useEffect(() => {
    if (gameMode === 'draft' && activeCombo) {
      generateCandidatesForSlot(GAME_SLOTS[activeSlotIndex], activeCombo, slots);
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

  // Start new multiplayer draft session
  const handleStartMultiplayer = (pCount: number, playerConfigs: { name: string; teamName: string; color: string }[]) => {
    setIsMultiplayer(true);
    setDifficultyMode('normal');
    
    // Clear simulation running profiles and selected modifiers
    setSimulationResult(null);
    setSimGpIdx(0);
    setSimPhase('intro');
    setSimActiveRaceIdx(-1);
    setSimRaceCompleted(false);
    setAvailableCards([]);
    setMultiplayerStrategies({});
    setMultiplayerCards({});

    // Create the multiplayer draft states for each player
    const initializedPlayers = playerConfigs.map((p, idx) => {
      const rolled = getRandomComboExcept([], false);
      return {
        id: idx + 1,
        name: p.name || `Jogador ${idx + 1}`,
        teamName: p.teamName || `Escuderia ${idx + 1}`,
        color: p.color || '#FF1801',
        slots: {},
        jokerAvailable: true,
        activeCombo: rolled,
      };
    });

    setMultiplayerPlayers(initializedPlayers);
    setActiveMultiPlayerIndex(0);
    setGameMode('draft');
    
    // Load candidates for current active player (Index 0)
    const firstPlayer = initializedPlayers[0];
    setActiveCombo(firstPlayer.activeCombo);
    setJokerAvailable(true);
    setSlots({}); 
    setActiveSlotIndex(0);
    generateCandidatesForSlot(GAME_SLOTS[0], firstPlayer.activeCombo, {});
    playBeep(440, 0.1);
    triggerToast('🏎️ Campeonato de ' + pCount + ' jogadores iniciado! Vez do ' + firstPlayer.name);
  };

  const triggerMultiplayerSimulation = (playersList: any[]) => {
    setGameMode('simulating');
    setSimActiveRaceIdx(-1);
    setSimLightsCount(0);
    setSimRaceCompleted(false);
    // Pick 3 random support cards
    const shuffled = [...BUFF_CARDS].sort(() => 0.5 - Math.random());
    setAvailableCards(shuffled.slice(0, 3)); 
    setBuffHistory([]);

    const results = runChampionshipSimulation({}, 'normal', 'Seu Time', '#FF3E3E', playersList);
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
          setSimLightsCount(6);
          playBeep(1000, 0.45);
          
          runStepByStepGPs(results);
        }, 1200);
      }
    }, 700);
  };

  // Start new draft session
  const handleStartGame = (mode: 'normal' | 'hard' | 'underdog') => {
    setIsMultiplayer(false); // Make sure to reset multiplayer flag when starting singleplayer!
    setDifficultyMode(mode);
    setSlots({});
    setActiveSlotIndex(0);
    setJokerAvailable(true);
    setGameMode('draft');
    
    // Reset simulation and persistent active running states
    setSimulationResult(null);
    setSimGpIdx(0);
    setSimPhase('intro');
    setSimActiveRaceIdx(-1);
    setSimRaceCompleted(false);
    setAvailableCards([]);
    setMultiplayerStrategies({});
    setMultiplayerCards({});
    
    // Draw first combination
    const rolled = getRandomComboExcept([], mode === 'underdog');
    setActiveCombo(rolled);
    generateCandidatesForSlot(GAME_SLOTS[0], rolled, {});
    playBeep(440, 0.1);
  };

  // Helper to determine if a driver choice is restricted under active rules
  const isCandidateRestricted = (cand: any) => {
    if (!cand || cand.entityType !== 'driver') return false;
    const rating = cand.rating_geral || 80;

    if (restrictiveMode === 'elite') {
      const hasTitles = (cand.titles && cand.titles > 0) || cand.name.includes('(Tetracampeão)') || cand.name.includes('(Mestre da Chuva)') || cand.name.includes('(O Professor)') || cand.name.includes('(Kaiser sob Chuva)') || cand.name.includes('(El Nano)');
      return rating < 83 && !hasTitles;
    }

    if (restrictiveMode === 'no-meme') {
      return rating < 60;
    }

    if (restrictiveMode === 'only-meme') {
      return rating >= 80;
    }

    return false;
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

      // Base name comparison helper (strips " (Mestre da Chuva)", "(O Professor)", etc.)
      const getBaseDriverName = (fullName: string) => {
        if (!fullName) return '';
        return fullName.split(' (')[0].trim();
      };

      const normalizeDriverName = (fullName: string) => {
        if (!fullName) return '';
        return fullName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split(' (')[0]
          .replace(/[^a-z0-9]/g, '')
          .trim();
      };

      const draftedNorms = new Set<string>();

      // Collect drafted base names across all slots and players
      if (isMultiplayer && multiplayerPlayers) {
        multiplayerPlayers.forEach(p => {
          if (p.slots) {
            Object.values(p.slots).forEach((item: any) => {
              if (item && item.name) {
                draftedNorms.add(normalizeDriverName(item.name));
              }
            });
          }
        });
      } else if (currentSlots) {
        Object.values(currentSlots).forEach((item: any) => {
          if (item && item.name) {
            draftedNorms.add(normalizeDriverName(item.name));
          }
        });
      }

      // Also grab already drafted drivers in singleplayer state
      if (slots) {
        Object.values(slots).forEach((item: any) => {
          if (item && item.name) {
            draftedNorms.add(normalizeDriverName(item.name));
          }
        });
      }

      // Filter drivers that match any drafted base name
      let filteredDrivers = teamDrivers.filter(d => !draftedNorms.has(normalizeDriverName(d.name)));

      // Map dynamic drivers from our loaded DRIVERS_META list as additional alternatives
      const extraPaddockPool = DRIVERS_META.map(meta => {
        let rating = 80;
        if (meta.tier === 'legend') rating = 94 + Math.min(5, meta.titles || 0);
        else if (meta.tier === 'strong') rating = 86 + Math.floor(Math.random() * 6);
        else if (meta.tier === 'average') rating = 75 + Math.floor(Math.random() * 10);
        else if (meta.tier === 'weak') rating = 50 + Math.floor(Math.random() * 16);
        else if (meta.tier === 'meme') rating = 30 + Math.floor(Math.random() * 25);

        const pace = Math.min(100, Math.max(10, rating + (Math.random() * 6 - 3)));
        const consistency = Math.min(100, Math.max(10, rating + (Math.random() * 6 - 3)));
        const chuva = (meta.styleTags?.includes('rain_master') || meta.styleTags?.includes('wet_weather') || meta.id?.includes('senna') || meta.id?.includes('schumacher')) ? 99 : Math.min(100, Math.max(10, rating + (Math.random() * 10 - 5)));
        const aggressiveness = meta.styleTags?.includes('aggressive') ? 92 : (meta.styleTags?.includes('smooth') ? 65 : 75 + Math.random() * 15);
        const reliability = Math.min(100, Math.max(10, rating + (Math.random() * 8 - 4)));

        return {
          id: `${meta.id}_paddock`,
          name: meta.name,
          country: meta.country,
          titles: meta.titles || 0,
          wins: meta.tier === 'legend' ? 35 : (meta.tier === 'strong' ? 5 : 0),
          podiums: meta.tier === 'legend' ? 80 : (meta.tier === 'strong' ? 12 : 0),
          poles: meta.tier === 'legend' ? 25 : (meta.tier === 'strong' ? 4 : 0),
          rating_geral: Math.round(rating),
          pace: Math.round(pace),
          consistency: Math.round(consistency),
          chuva: Math.round(chuva),
          aggressiveness: Math.round(Math.min(100, Math.max(10, aggressiveness))),
          reliability: Math.round(reliability),
          description: meta.notes || 'Piloto de renome histórico trazido à mesa de negociações do paddock.',
          entityType: 'driver',
          sourceTeam: 'Mercado de Pilotos',
          sourceSeason: meta.eraStart || 2026,
        };
      });

      const validExtraDrivers = extraPaddockPool.filter(d => !draftedNorms.has(normalizeDriverName(d.name)));

      // Inject up to 2 random historic pilots from the external metadata into the draft options pool!
      if (validExtraDrivers.length > 0) {
        const shuffledExtras = [...validExtraDrivers].sort(() => 0.5 - Math.random());
        const chosenExtras = shuffledExtras.slice(0, 2);
        filteredDrivers = [...filteredDrivers, ...chosenExtras];
      }

      // Historically bad drivers pool (20-50 ratings) to create severe frustration
      const badDriversPool = [
        {
          id: 'yuji_ide',
          name: 'Yuji Ide',
          country: 'Japão 🇯🇵',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 32,
          pace: 35,
          consistency: 20,
          chuva: 30,
          aggressiveness: 99,
          reliability: 25,
          description: 'Teve a superlicença cassada após capotar Christijan Albers em Imola 2006. Perigo público no asfalto.',
          entityType: 'driver',
          sourceTeam: 'Super Aguri',
          sourceSeason: 2006,
        },
        {
          id: 'chanoch_nissany',
          name: 'Chanoch Nissany',
          country: 'Israel 🇮🇱',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 25,
          pace: 15,
          consistency: 30,
          chuva: 20,
          aggressiveness: 10,
          reliability: 40,
          description: 'Ficou a 13 segundos do melhor tempo comum nos treinos livres e pediu para puxarem o carro da brita por telefone.',
          entityType: 'driver',
          sourceTeam: 'Minardi',
          sourceSeason: 2005,
        },
        {
          id: 'taki_inoue',
          name: 'Taki Inoue',
          country: 'Japão 🇯🇵',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 35,
          pace: 30,
          consistency: 38,
          chuva: 25,
          aggressiveness: 45,
          reliability: 30,
          description: 'Famoso por ser atropelado por um safety car estacionando em Mônaco, e depois atropelado pelo caminhão de resgate na Hungria.',
          entityType: 'driver',
          sourceTeam: 'Footwork',
          sourceSeason: 1995,
        },
        {
          id: 'ricardo_rosset',
          name: 'Ricardo Rosset',
          country: 'Brasil 🇧🇷',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 38,
          pace: 42,
          consistency: 32,
          chuva: 35,
          aggressiveness: 55,
          reliability: 40,
          description: 'Ficava fora dos 107% rotineiramente e uma vez bateu de frente nos pneus ao tentar retornar à pista.',
          entityType: 'driver',
          sourceTeam: 'Tyrrell',
          sourceSeason: 1998,
        },
        {
          id: 'giovanni_lavaggi',
          name: 'Giovanni Lavaggi',
          country: 'Itália 🇮🇹',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 40,
          pace: 45,
          consistency: 35,
          chuva: 38,
          aggressiveness: 40,
          reliability: 45,
          description: 'Conhecido vulgarmente como "Johnny Carwash" por sua lentidão extrema e incapacidade mecânica absoluta.',
          entityType: 'driver',
          sourceTeam: 'Minardi',
          sourceSeason: 1996,
        },
        {
          id: 'perry_mccarthy',
          name: 'Perry McCarthy',
          country: 'Reino Unido 🇬🇧',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 42,
          pace: 48,
          consistency: 30,
          chuva: 40,
          aggressiveness: 60,
          reliability: 35,
          description: 'Correu pela tenebrosa e falida Andrea Moda e é o Stig original cinzento do clássico programa Top Gear.',
          entityType: 'driver',
          sourceTeam: 'Andrea Moda',
          sourceSeason: 1992,
        },
        {
          id: 'alex_yoong',
          name: 'Alex Yoong',
          country: 'Malásia 🇲🇾',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 44,
          pace: 46,
          consistency: 42,
          chuva: 50,
          aggressiveness: 52,
          reliability: 55,
          description: 'Ficou fora de limites na classificação por mais de 5 segundos correndo pela simpática Minardi.',
          entityType: 'driver',
          sourceTeam: 'Minardi',
          sourceSeason: 2002,
        },
        {
          id: 'jean_denis_deletraz',
          name: 'Jean-Denis Deletraz',
          country: 'Suíça 🇨🇭',
          titles: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          rating_geral: 36,
          pace: 34,
          consistency: 25,
          chuva: 35,
          aggressiveness: 40,
          reliability: 30,
          description: 'Terminou Adelaide 1994 dez voltas atrás do líder em apenas algumas passagens, andando mais lento que carros comuns de rua.',
          entityType: 'driver',
          sourceTeam: 'Larrousse',
          sourceSeason: 1994,
        }
      ];

      // Shuffle and select up to 2 bad drivers that are not yet drafted, and inject them
      const notDraftedBad = badDriversPool.filter(b => !draftedNorms.has(normalizeDriverName(b.name)));
      const shuffledBad = [...notDraftedBad].sort(() => 0.5 - Math.random());
      const selectedBad = shuffledBad.slice(0, 2);

      filteredDrivers = [...filteredDrivers, ...selectedBad];

      // Ensure absolute uniqueness within the generated choices pool too!
      const uniqueGeneratedCandidates: any[] = [];
      const generatedNorms = new Set<string>();
      filteredDrivers.forEach(d => {
        const norm = normalizeDriverName(d.name);
        if (!generatedNorms.has(norm) && !draftedNorms.has(norm)) {
          generatedNorms.add(norm);
          uniqueGeneratedCandidates.push(d);
        }
      });

      // Just in case slots are somehow completely empty, inject a classic fallback
      if (uniqueGeneratedCandidates.length === 0) {
        const fallbackName = 'Lewis Hamilton (Clássico)';
        if (!draftedNorms.has(normalizeDriverName(fallbackName))) {
          uniqueGeneratedCandidates.push({
            id: 'hamilton_classic',
            name: fallbackName,
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
        } else {
          uniqueGeneratedCandidates.push({
            id: 'generic_legend_backup',
            name: 'Piloto Lendário Coringa',
            country: 'Mundo 🌐',
            titles: 1,
            wins: 20,
            podiums: 50,
            poles: 10,
            rating_geral: 90,
            pace: 90,
            consistency: 90,
            chuva: 90,
            aggressiveness: 80,
            reliability: 92,
            description: 'Piloto extremamente experiente que se juntou de última hora.',
            entityType: 'driver',
            sourceTeam: combo.teamName,
            sourceSeason: combo.season,
          } as any);
        }
      }

      // Shuffle options to maximize randomness and slice to at most 3 elements to reduce selection fatigue
      const randomizedSubset = [...uniqueGeneratedCandidates].sort(() => 0.5 - Math.random()).slice(0, 3);
      setCandidates(randomizedSubset);

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

      // Add sibling alternatives from our database for exactly 3 options
      const otherCombos = SEASONS_TEAMS.filter(t => t.teamId !== combo.teamId);
      if (otherCombos.length > 0) {
        const shuffledOthers = [...otherCombos].sort(() => 0.5 - Math.random());
        shuffledOthers.slice(0, 2).forEach(randomOther => {
          candidatesList.push({
            ...randomOther.boss,
            entityType: 'boss',
            sourceTeam: randomOther.teamName,
            sourceSeason: randomOther.season,
          });
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
        const shuffledOthers = [...otherCombos].sort(() => 0.5 - Math.random());
        shuffledOthers.slice(0, 2).forEach(randomOther => {
          candidatesList.push({
            ...randomOther.chassis,
            entityType: 'chassis',
            sourceTeam: randomOther.teamName,
            sourceSeason: randomOther.season,
          });
        });
      }
      setCandidates(candidatesList);

    } else if (currentSlot.type === 'engine') {
      // Resolve culturally matched engine first from ENGINES_META
      const chassisEngineStr = combo.chassis.engine?.toLowerCase() || '';
      let matched = ENGINES_META.find(e => 
        chassisEngineStr.includes(e.brand.toLowerCase()) || 
        chassisEngineStr.includes(e.name.toLowerCase()) ||
        e.bestKnownTeams.some(t => combo.teamName.toLowerCase().includes(t.toLowerCase()))
      );
      if (!matched) {
        // Fallback to Renault or Ferrari if no obvious match
        matched = ENGINES_META.find(e => e.id === 'mercedes_hybrid') || ENGINES_META[0];
      }

      const candidatesList = [
        {
          ...matched,
          entityType: 'engine',
          sourceTeam: combo.teamName,
          sourceSeason: combo.season,
        }
      ];

      // Fill remaining 2 options with random distinct engines
      const otherEngines = ENGINES_META.filter(e => e.id !== matched!.id);
      const shuffledOthers = [...otherEngines].sort(() => 0.5 - Math.random());
      shuffledOthers.slice(0, 2).forEach(unmatched => {
        candidatesList.push({
          ...unmatched,
          entityType: 'engine',
          sourceTeam: 'Mercado de Motores',
          sourceSeason: combo.season,
        });
      });

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
        const shuffledOthers = [...otherCombos].sort(() => 0.5 - Math.random());
        shuffledOthers.slice(0, 2).forEach(randomOther => {
          candidatesList.push({
            ...randomOther.strategist,
            entityType: 'strategist',
            sourceTeam: randomOther.teamName,
            sourceSeason: randomOther.season,
          });
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
        const shuffledOthers = [...otherCombos].sort(() => 0.5 - Math.random());
        shuffledOthers.slice(0, 2).forEach(randomOther => {
          candidatesList.push({
            ...randomOther.engineer,
            entityType: 'engineer',
            sourceTeam: randomOther.teamName,
            sourceSeason: randomOther.season,
          });
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
    
    if (isMultiplayer) {
      const updatedPlayers = [...multiplayerPlayers];
      updatedPlayers[activeMultiPlayerIndex] = {
        ...updatedPlayers[activeMultiPlayerIndex],
        jokerAvailable: false,
        activeCombo: rolled
      };
      setMultiplayerPlayers(updatedPlayers);
    }

    playBeep(650, 0.15);
    triggerToast('🎲 Coringa ativado! Uma nova escuderia e era histórica foram sorteadas.');
  };

  // Handle manual selection of slot index in sidebar to edit or recruit it
  const handleSelectSlotIndex = (idx: number) => {
    setActiveSlotIndex(idx);
    const rolled = activeCombo || getRandomComboExcept([], difficultyMode === 'underdog');
    setActiveCombo(rolled);
    generateCandidatesForSlot(GAME_SLOTS[idx], rolled, slots);
    
    if (isMultiplayer) {
      const updatedPlayers = [...multiplayerPlayers];
      updatedPlayers[activeMultiPlayerIndex] = {
        ...updatedPlayers[activeMultiPlayerIndex],
        activeCombo: rolled
      };
      setMultiplayerPlayers(updatedPlayers);
    }

    playBeep(440, 0.05);
  };

  // Handle Draft Selection
  const handleSelectCandidate = (item: any) => {
    if (isCandidateRestricted(item)) {
      triggerToast('⚠️ Este piloto está bloqueado sob a restrição de Cockpit atual! Ajuste o nível de restrição ou use Coringa.');
      playBeep(220, 0.15);
      return;
    }

    const activeSlot = GAME_SLOTS[activeSlotIndex];
    const newSlots = { ...slots, [activeSlot.id]: item };
    setSlots(newSlots);

    // Dynamic click feedback
    playBeep(880, 0.08);

    if (isMultiplayer) {
      const updatedPlayers = [...multiplayerPlayers];
      updatedPlayers[activeMultiPlayerIndex] = {
        ...updatedPlayers[activeMultiPlayerIndex],
        slots: newSlots,
      };
      setMultiplayerPlayers(updatedPlayers);

      const unfilledSlots = GAME_SLOTS.filter(s => !newSlots[s.id]);

      if (unfilledSlots.length > 0) {
        let nextIndex = activeSlotIndex + 1;
        if (nextIndex >= GAME_SLOTS.length || newSlots[GAME_SLOTS[nextIndex].id]) {
          const firstEmptyIdx = GAME_SLOTS.findIndex(s => !newSlots[s.id]);
          if (firstEmptyIdx !== -1) {
            nextIndex = firstEmptyIdx;
          }
        }

        if (nextIndex < GAME_SLOTS.length) {
          setActiveSlotIndex(nextIndex);
          const rolled = getRandomComboExcept([], false);
          updatedPlayers[activeMultiPlayerIndex] = {
            ...updatedPlayers[activeMultiPlayerIndex],
            slots: newSlots,
            activeCombo: rolled
          };
          setMultiplayerPlayers(updatedPlayers);
          setActiveCombo(rolled);
          generateCandidatesForSlot(GAME_SLOTS[nextIndex], rolled, newSlots);
        }
      } else {
        // This player has finished drafting! Let's see if anyone else is still unfinished:
        const everyoneReady = updatedPlayers.every(p => GAME_SLOTS.every(s => p.slots[s.id]));
        if (everyoneReady) {
          triggerToast('🎉 Todos os jogadores completaram o Draft! Iniciando simulação...');
          triggerMultiplayerSimulation(updatedPlayers);
        } else {
          // Switch to the next unfinished player!
          const nextUnfinishedIdx = updatedPlayers.findIndex(p => GAME_SLOTS.some(s => !p.slots[s.id]));
          if (nextUnfinishedIdx !== -1) {
            // Save before switching
            setMultiplayerPlayers(updatedPlayers);
            // Switch active player
            setActivePlayer(nextUnfinishedIdx);
            triggerToast(`🏁 ${updatedPlayers[activeMultiPlayerIndex].teamName} terminou o Draft! Turno de ${updatedPlayers[nextUnfinishedIdx].name}`);
          }
        }
      }
    } else {
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
    const results = runChampionshipSimulation(finalSlots, difficultyMode, playerTeamName, playerTeamColor);
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
          runStepByStepGPs(results);
        }, 1200);
      }
    }, 700);
  };

  // Run single-GP Simulation inside App.tsx with strategies, card buffs, and MarioKart Mode
  const runMultiplayerGPSimulation = (
    gpIdx: number,
    strategies: Record<number, string>,
    cards: Record<number, { cardId: string; racesLeft: number }>,
    enableMarioKart: boolean
  ) => {
    const finalPlayers = multiplayerPlayers && multiplayerPlayers.length > 0 
      ? multiplayerPlayers 
      : [{ id: 1, name: 'Jogador 1', teamName: playerTeamName, color: playerTeamColor, slots }];

    const userDrivers: DriverEntry[] = [];
    const narrationHighlights: string[] = [];

    finalPlayers.forEach(player => {
      const pSlots = player.slots;
      const d1 = pSlots['driver_1'];
      const d2 = pSlots['driver_2'];
      const reserve1 = pSlots['reserve_1'];
      const engine = pSlots['engine'];
      const boss = pSlots['team_boss'];
      const chassis = pSlots['chassis'];
      const strategist = pSlots['strategist'];
      const engineer = pSlots['engineer'];

      const combos = detectCombos(pSlots);
      const totalComboBonus = combos.reduce((acc, c) => acc + c.bonusValue, 0);

      const bossRating = boss?.rating_geral || 85;
      const chassisRating = chassis?.rating_geral || 85;
      const strategistRating = strategist?.rating_geral || 85;
      const engineerRating = engineer?.rating_geral || 85;

      const enginePower = (engine?.powerBias || 8.5) * 10;
      const engineReliability = (engine?.reliabilityBias || 8.5) * 10;
      const engineDriveability = (engine?.driveabilityBias || 8.5) * 10;

      const supportBonus = (reserve1?.rating_geral || 80) / 20;

      const reliabilityScore = ((chassis?.reliability || 85) + engineerRating + (boss?.pressure_handling || 85) + engineReliability) / 4 + totalComboBonus / 2;

      const playerStrat = strategies[player.id] || 'equilibrada';
      const playerCard = cards[player.id]?.racesLeft > 0 ? cards[player.id].cardId : null;

      let stratPaceMod = 0;
      let stratReliabilityMod = 0;
      let stratConsistencyMod = 0;
      let stratChuvaMod = 0;

      if (playerStrat === 'agressiva') {
        stratPaceMod = 7;
        stratReliabilityMod = -15;
      } else if (playerStrat === 'conservadora') {
        stratPaceMod = -4;
        stratReliabilityMod = 22;
      } else if (playerStrat === 'climatica') {
        if (CIRCUITS[gpIdx].isWet) {
          stratChuvaMod = 12;
          stratPaceMod = 4;
        } else {
          stratPaceMod = -4;
        }
      } else if (playerStrat === 'tecnica') {
        const type = CIRCUITS[gpIdx].type;
        if (type === 'rua' || type === 'técnico') {
          stratConsistencyMod = 8;
          stratPaceMod = 4;
        } else if (type === 'veloz') {
          stratPaceMod = -5;
        }
      }

      let cardPaceMod = 0;
      let cardReliabilityMod = 0;
      let cardWinnerPush = false;
      let cardDriver2Push = false;

      if (playerCard === 'drs') {
        cardPaceMod = 8;
      } else if (playerCard === 'party_mode') {
        cardWinnerPush = true;
      } else if (playerCard === 'shield') {
        cardReliabilityMod = 40;
        cardPaceMod = 3;
      } else if (playerCard === 'stop_iceman') {
        cardPaceMod = 6;
      } else if (playerCard === 'forced_rain') {
        if (CIRCUITS[gpIdx].isWet) {
          cardPaceMod = 10;
        } else {
          cardPaceMod = 3;
        }
      } else if (playerCard === 'multi21') {
        cardDriver2Push = true;
      }

      const userDriver1: DriverEntry = {
        name: d1?.name || `${player.name} Piloto 1`,
        team: player.teamName,
        color: player.color,
        pace: (d1?.pace || 85) + (chassisRating * 0.15) + (engineerRating * 0.1) + (enginePower * 0.12) + totalComboBonus / 3 + supportBonus + stratPaceMod + cardPaceMod + (cardWinnerPush ? 15 : 0),
        consistency: (d1?.consistency || 85) + (bossRating * 0.08) + (engineDriveability * 0.06) + totalComboBonus / 4 + stratConsistencyMod,
        chuva: (d1?.chuva || 85) + (engineDriveability * 0.05) + totalComboBonus / 4 + stratChuvaMod,
        aggressiveness: d1?.aggressiveness || 85,
        reliability: reliabilityScore + stratReliabilityMod + cardReliabilityMod,
        isUser: true,
        driverIndex: 1,
        playerId: player.id,
        slots: pSlots,
      };

      const userDriver2: DriverEntry = {
        name: d2?.name || `${player.name} Piloto 2`,
        team: player.teamName,
        color: player.color,
        pace: (d2?.pace || 83) + (chassisRating * 0.15) + (engineerRating * 0.1) + (enginePower * 0.12) + totalComboBonus / 3 + supportBonus + stratPaceMod + cardPaceMod + (cardDriver2Push ? 12 : 0),
        consistency: (d2?.consistency || 82) + (bossRating * 0.08) + (engineDriveability * 0.06) + totalComboBonus / 4 + stratConsistencyMod,
        chuva: (d2?.chuva || 83) + (engineDriveability * 0.05) + totalComboBonus / 4 + stratChuvaMod,
        aggressiveness: d2?.aggressiveness || 85,
        reliability: reliabilityScore + stratReliabilityMod + cardReliabilityMod,
        isUser: true,
        driverIndex: 2,
        playerId: player.id,
        slots: pSlots,
      };

      userDrivers.push(userDriver1, userDriver2);
    });

    const normalizeDriverNameForGrid = (fullName: string) => {
      if (!fullName) return '';
      return fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(' (')[0]
        .replace(/[^a-z0-9]/g, '')
        .trim();
    };

    const hiredNames = new Set<string>();
    userDrivers.forEach(ud => {
      if (ud.name) hiredNames.add(normalizeDriverNameForGrid(ud.name));
    });

    const RIVAL_REPLACEMENTS: Record<string, { name: string; pace: number; consistency: number; chuva: number; aggressiveness: number; reliability: number }[]> = {
      'Michael Schumacher': [
        { name: 'Kimi Räikkönen', pace: 93, consistency: 94, chuva: 90, aggressiveness: 82, reliability: 95 },
        { name: 'Felipe Massa', pace: 88, consistency: 87, chuva: 85, aggressiveness: 84, reliability: 92 },
        { name: 'Jean Alesi', pace: 86, consistency: 84, chuva: 92, aggressiveness: 88, reliability: 85 }
      ],
      'Rubens Barrichello': [
        { name: 'Eddie Irvine', pace: 85, consistency: 86, chuva: 82, aggressiveness: 83, reliability: 90 },
        { name: 'Felipe Massa', pace: 88, consistency: 87, chuva: 85, aggressiveness: 84, reliability: 92 },
        { name: 'Gerhard Berger', pace: 89, consistency: 88, chuva: 87, aggressiveness: 85, reliability: 91 }
      ],
      'Ayrton Senna': [
        { name: 'Mika Häkkinen', pace: 96, consistency: 93, chuva: 94, aggressiveness: 88, reliability: 92 },
        { name: 'Gerhard Berger', pace: 89, consistency: 88, chuva: 87, aggressiveness: 85, reliability: 91 },
        { name: 'Stefan Johansson', pace: 82, consistency: 84, chuva: 80, aggressiveness: 75, reliability: 89 }
      ],
      'Alain Prost': [
        { name: 'Niki Lauda', pace: 94, consistency: 98, chuva: 85, aggressiveness: 72, reliability: 97 },
        { name: 'Keke Rosberg', pace: 91, consistency: 88, chuva: 89, aggressiveness: 94, reliability: 86 },
        { name: 'Damon Hill', pace: 89, consistency: 91, chuva: 92, aggressiveness: 80, reliability: 93 }
      ],
      'Max Verstappen': [
        { name: 'Daniel Ricciardo', pace: 90, consistency: 89, chuva: 88, aggressiveness: 85, reliability: 93 },
        { name: 'Carlos Sainz', pace: 89, consistency: 91, chuva: 88, aggressiveness: 82, reliability: 94 },
        { name: 'Lando Norris', pace: 91, consistency: 90, chuva: 89, aggressiveness: 84, reliability: 95 }
      ],
      'Sergio Pérez': [
        { name: 'Nico Hülkenberg', pace: 84, consistency: 85, chuva: 84, aggressiveness: 80, reliability: 91 },
        { name: 'Esteban Ocon', pace: 83, consistency: 86, chuva: 85, aggressiveness: 83, reliability: 90 },
        { name: 'Alexander Albon', pace: 85, consistency: 84, chuva: 82, aggressiveness: 81, reliability: 92 }
      ],
      'Lewis Hamilton': [
        { name: 'George Russell', pace: 90, consistency: 88, chuva: 89, aggressiveness: 86, reliability: 93 },
        { name: 'Nico Rosberg', pace: 92, consistency: 91, chuva: 88, aggressiveness: 85, reliability: 94 },
        { name: 'Jenson Button', pace: 88, consistency: 95, chuva: 97, aggressiveness: 78, reliability: 96 }
      ],
      'Valtteri Bottas': [
        { name: 'Heikki Kovalainen', pace: 83, consistency: 82, chuva: 80, aggressiveness: 78, reliability: 89 },
        { name: 'Esteban Ocon', pace: 83, consistency: 86, chuva: 85, aggressiveness: 83, reliability: 90 },
        { name: 'George Russell', pace: 90, consistency: 88, chuva: 89, aggressiveness: 86, reliability: 93 }
      ],
      'Nigel Mansell': [
        { name: 'Damon Hill', pace: 89, consistency: 91, chuva: 92, aggressiveness: 80, reliability: 93 },
        { name: 'David Coulthard', pace: 86, consistency: 88, chuva: 84, aggressiveness: 78, reliability: 92 },
        { name: 'Thierry Boutsen', pace: 84, consistency: 85, chuva: 83, aggressiveness: 76, reliability: 90 }
      ],
      'Riccardo Patrese': [
        { name: 'Jacques Villeneuve', pace: 91, consistency: 87, chuva: 85, aggressiveness: 90, reliability: 89 },
        { name: 'David Coulthard', pace: 86, consistency: 88, chuva: 84, aggressiveness: 78, reliability: 92 },
        { name: 'Thierry Boutsen', pace: 84, consistency: 85, chuva: 83, aggressiveness: 76, reliability: 90 }
      ],
      'Fernando Alonso': [
        { name: 'Jarno Trulli', pace: 87, consistency: 85, chuva: 83, aggressiveness: 79, reliability: 91 },
        { name: 'Nelson Piquet Jr', pace: 78, consistency: 75, chuva: 78, aggressiveness: 80, reliability: 82 },
        { name: 'Romain Grosjean', pace: 84, consistency: 78, chuva: 80, aggressiveness: 86, reliability: 81 }
      ],
      'Giancarlo Fisichella': [
        { name: 'Jarno Trulli', pace: 87, consistency: 85, chuva: 83, aggressiveness: 79, reliability: 91 },
        { name: 'Heikki Kovalainen', pace: 83, consistency: 82, chuva: 80, aggressiveness: 78, reliability: 89 },
        { name: 'Nelson Piquet Jr', pace: 78, consistency: 75, chuva: 78, aggressiveness: 80, reliability: 82 }
      ],
      'Sebastian Vettel': [
        { name: 'Kimi Räikkönen', pace: 93, consistency: 94, chuva: 90, aggressiveness: 82, reliability: 95 },
        { name: 'Daniel Ricciardo', pace: 90, consistency: 89, chuva: 88, aggressiveness: 85, reliability: 93 },
        { name: 'Mark Webber', pace: 88, consistency: 89, chuva: 86, aggressiveness: 85, reliability: 92 }
      ],
      'Mark Webber': [
        { name: 'David Coulthard', pace: 86, consistency: 88, chuva: 84, aggressiveness: 78, reliability: 92 },
        { name: 'Nick Heidfeld', pace: 85, consistency: 89, chuva: 87, aggressiveness: 77, reliability: 93 },
        { name: 'Christian Klien', pace: 79, consistency: 80, chuva: 76, aggressiveness: 82, reliability: 86 }
      ]
    };

    const usedReplacementNames = new Set<string>();

    const cleanRivalDrivers = RIVAL_DRIVERS.map(rival => {
      const rivalNorm = normalizeDriverNameForGrid(rival.name);
      if (hiredNames.has(rivalNorm)) {
        const replacements = RIVAL_REPLACEMENTS[rival.name] || [];
        let chosenRep = replacements.find(rep => {
          const repNorm = normalizeDriverNameForGrid(rep.name);
          return !hiredNames.has(repNorm) && !usedReplacementNames.has(repNorm);
        });
        if (!chosenRep) {
          const fallbacks = [
            { name: 'Robert Kubica', pace: 88, consistency: 90, chuva: 89, aggressiveness: 84, reliability: 91 },
            { name: 'Heinz-Harald Frentzen', pace: 86, consistency: 85, chuva: 88, aggressiveness: 80, reliability: 89 },
            { name: 'Johnny Herbert', pace: 84, consistency: 85, chuva: 83, aggressiveness: 78, reliability: 90 },
            { name: 'Nick Heidfeld', pace: 85, consistency: 89, chuva: 87, aggressiveness: 77, reliability: 93 },
            { name: 'Olivier Panis', pace: 83, consistency: 84, chuva: 85, aggressiveness: 76, reliability: 88 },
          ];
          chosenRep = fallbacks.find(rep => {
            const repNorm = normalizeDriverNameForGrid(rep.name);
            return !hiredNames.has(repNorm) && !usedReplacementNames.has(repNorm);
          }) || { name: 'Piloto Reserva Legendário', pace: 82, consistency: 82, chuva: 82, aggressiveness: 80, reliability: 88 };
        }
        usedReplacementNames.add(normalizeDriverNameForGrid(chosenRep.name));
        return {
          ...rival,
          name: chosenRep.name,
          pace: chosenRep.pace,
          consistency: chosenRep.consistency,
          chuva: chosenRep.chuva,
          aggressiveness: chosenRep.aggressiveness,
          reliability: chosenRep.reliability,
        };
      }
      return rival;
    });

    const gridDrivers: DriverEntry[] = [...cleanRivalDrivers, ...userDrivers];
    const race = CIRCUITS[gpIdx];
    const driverRaceScores: { driver: DriverEntry; score: number; dnf: boolean; dnfReason?: string; trackEffect?: string }[] = [];

    gridDrivers.forEach(drv => {
      let baseGridScore = 0;

      if (race.type === 'veloz') {
        const topSpeedFactor = drv.isUser ? (drv.slots?.['chassis']?.top_speed || 85) : 95;
        baseGridScore += drv.pace * 0.5 + topSpeedFactor * 0.5;
      } else if (race.type === 'rua' || race.type === 'técnico') {
        const pSlots = drv.slots;
        const chassisAero = pSlots?.['chassis']?.aerodynamics || 85;
        const pBossRating = pSlots?.['team_boss']?.rating_geral || 85;
        const pStrategistRating = pSlots?.['strategist']?.rating_geral || 85;
        const pStratFactor = (pStrategistRating + pBossRating) / 2;
        const aeroFactor = drv.isUser ? (chassisAero * 0.4 + pStratFactor * 0.3) : 94;
        baseGridScore += drv.pace * 0.5 + drv.consistency * 0.3 + aeroFactor * 0.2;
      } else {
        baseGridScore += drv.pace * 0.6 + drv.consistency * 0.4;
      }

      if (race.isWet) {
        const wetAdvantage = drv.chuva;
        baseGridScore = (wetAdvantage * 0.8) + (drv.pace * 0.2) + 12;
      }

      let trackModifier = 0;
      let trackEffectDesc = '';

      if (race.isWet) {
        if (drv.chuva >= 94) {
          trackModifier += 6;
          trackEffectDesc = '🌧️ Rei de Pista Molhada (+6)';
        } else if (drv.chuva < 82) {
          trackModifier -= 5;
          trackEffectDesc = '⚠️ Escorregando na Chuva (-5)';
        }
      } else {
        if (drv.aggressiveness >= 94 && (race.type === 'veloz' || race.type === 'rua')) {
          trackModifier += 3;
          trackEffectDesc = '🔥 Overtake Agressivo (+3)';
        }
      }

      if (race.type === 'veloz') {
        if (drv.pace >= 97) {
          trackModifier += 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | ⚡ Ritmo de Reta (+4)` : '⚡ Ritmo de Reta (+4)';
        } else if (drv.pace < 85) {
          trackModifier -= 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 🐢 Baixa Potência (-4)` : '🐢 Baixa Potência (-4)';
        }
      } else if (race.type === 'rua') {
        if (drv.consistency >= 94) {
          trackModifier += 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 🛡️ Precisão Urbana (+4)` : '🛡️ Precisão Urbana (+4)';
        } else if (drv.consistency < 84) {
          trackModifier -= 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 💥 Risco de Muro (-4)` : '💥 Risco de Muro (-4)';
        }
      } else if (race.type === 'técnico') {
        if (drv.consistency >= 95) {
          trackModifier += 3;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 📐 Curvatura Técnica (+3)` : '📐 Curvatura Técnica (+3)';
        }
        if (drv.aggressiveness >= 95) {
          trackModifier -= 3;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | ⛔ Desgaste de Pneus (-3)` : '⛔ Desgaste de Pneus (-3)';
        }
      }

      let adjustedGridScore = baseGridScore + trackModifier;
      const rngFactor = (Math.random() - 0.5) * 16;
      let finalScore = adjustedGridScore + rngFactor;

      const dnfRoll = Math.random() * 100;
      let isDnf = false;
      let dnfReason = '';

      const totalDnfChance = Math.max(1, (100 - drv.reliability) * 0.15 + drv.aggressiveness * 0.04);
      if (dnfRoll < totalDnfChance) {
        isDnf = true;
        const reasons = [
          'Pane Elétrica Geral',
          'Estouro Súbito de Pneu',
          'Vazamento de Óleo',
          'Superaquecimento do Motor',
          'Ruptura na Barra de Direção',
          'Colisão catastrófica na curva 1',
          'Furo de radiador por detrito',
          'Rodada na brita com motor apagado',
          'Caixa de câmbio travada em 3ª marcha'
        ];
        dnfReason = reasons[Math.floor(Math.random() * reasons.length)];
      }

      driverRaceScores.push({
        driver: drv,
        score: isDnf ? -999 : finalScore,
        dnf: isDnf,
        dnfReason,
        trackEffect: trackEffectDesc || undefined
      });
    });

    if (enableMarioKart) {
      driverRaceScores.sort((a, b) => b.score - a.score);
      const numGridDrivers = driverRaceScores.length;

      driverRaceScores.forEach((item, index) => {
        if (item.dnf) return;
        const roll = Math.random();

        if (index <= 2) {
          if (roll < 0.35) {
            const drop = 25 + Math.random() * 20;
            item.score -= drop;
            item.trackEffect = item.trackEffect 
              ? `${item.trackEffect} | 🐢 Atingido por Casco Azul (-${drop.toFixed(0)} pts)` 
              : `🐢 Casco Azul (-${drop.toFixed(0)} pts)`;
            narrationHighlights.push(`🐢 [MARIOKART] Caos total! O líder ${item.driver.name.split(' ').pop()} foi atingido por um Casco Azul voador e perdeu muito tempo!`);
          } else if (roll < 0.50) {
            const drop = 12 + Math.random() * 8;
            item.score -= drop;
            item.trackEffect = item.trackEffect 
              ? `${item.trackEffect} | 🍌 Escorregou em Casca de Banana` 
              : `🍌 Bananada tática`;
          }
        } else if (index >= numGridDrivers - 4) {
          if (roll < 0.45) {
            const boost = 35 + Math.random() * 25;
            item.score += boost;
            item.trackEffect = item.trackEffect 
              ? `${item.trackEffect} | ⚡ Modo Bullet Bill (+${boost.toFixed(0)} pts)` 
              : `⚡ Bullet Bill (+${boost.toFixed(0)} pts)`;
            narrationHighlights.push(`⚡ [MARIOKART] Incrível! ${item.driver.name.split(' ').pop()} ativou o Bullet Bill de última hora e rasgou o asfalto saltando posições!`);
          } else if (roll < 0.70) {
            const boost = 15 + Math.random() * 10;
            item.score += boost;
            item.trackEffect = item.trackEffect 
              ? `${item.trackEffect} | 🍄 Turbo de Cogumelo Triplo (+${boost.toFixed(0)} pts)` 
              : `🍄 Cogumelos Triplos (+${boost.toFixed(0)} pts)`;
          }
        } else {
          if (roll < 0.20) {
            const boost = 10 + Math.random() * 12;
            item.score += boost;
            item.trackEffect = item.trackEffect ? `${item.trackEffect} | 🌟 Estrela de Invencibilidade` : `🌟 Estrela Ativada`;
          } else if (roll < 0.40) {
            const drop = 10 + Math.random() * 10;
            item.score -= drop;
            item.trackEffect = item.trackEffect ? `${item.trackEffect} | 🔴 Casco Vermelho` : `🔴 Casco Vermelho`;
          }
        }
      });
    }

    driverRaceScores.sort((a, b) => {
      if (a.dnf && !b.dnf) return 1;
      if (!a.dnf && b.dnf) return -1;
      return b.score - a.score;
    });

    const f1Points = [10, 8, 6, 5, 4, 3, 2, 1, 0, 0];
    const podium: { driver: string; team: string; color: string }[] = [];
    const positions: { driver: string; team: string; points: number; color: string; dnf: boolean; incident?: string; trackEffect?: string }[] = [];

    driverRaceScores.forEach((item, posIdx) => {
      const isDnf = item.dnf;
      const pointsEarned = (!isDnf && posIdx < 10) ? f1Points[posIdx] : 0;

      if (!isDnf && podium.length < 3) {
        podium.push({
          driver: item.driver.name,
          team: item.driver.team,
          color: item.driver.color,
        });
      }

      positions.push({
        driver: item.driver.name,
        team: item.driver.team,
        points: pointsEarned,
        color: item.driver.color,
        dnf: isDnf,
        incident: isDnf ? item.dnfReason : undefined,
        trackEffect: item.trackEffect
      });
    });

    return {
      podium,
      positions,
      highlights: narrationHighlights
    };
  };

  const handleConfirmMultiplayerStrategy = () => {
    if (!simulationResult) return;

    // Simulate the specific GP with updated driver profiles based on strategy selections, card buffs & MarioKart effect
    const results = runMultiplayerGPSimulation(simGpIdx, multiplayerStrategies, multiplayerCards, marioKartMode);
    
    // Deep clone simulationResult to replace active race result
    const clonedRes = JSON.parse(JSON.stringify(simulationResult));
    
    if (clonedRes.raceResults[simGpIdx]) {
      clonedRes.raceResults[simGpIdx].podium = results.podium;
      clonedRes.raceResults[simGpIdx].positions = results.positions;
    }

    // Prepend any MarioKart alerts or strategy narrations
    if (results.highlights.length > 0) {
      clonedRes.narrationHighlights = [...results.highlights, ...clonedRes.narrationHighlights];
    } else {
      clonedRes.narrationHighlights.unshift(`🔧 Estratégia de corrida aplicada por todas as escuderias para o GP de ${CIRCUITS[simGpIdx].name}!`);
    }

    // Recalculate season points
    const recalculated = recalculateStandingsFromRaces(clonedRes.raceResults);
    clonedRes.driverStandings = recalculated.driverStandings;
    clonedRes.teamStandings = recalculated.teamStandings;

    // Apply card remaining races decays
    const updatedCards = { ...multiplayerCards };
    multiplayerPlayers.forEach(p => {
      const activeC = updatedCards[p.id];
      if (activeC && activeC.racesLeft > 0) {
        const nextVal = activeC.racesLeft - 1;
        if (nextVal <= 0) {
          delete updatedCards[p.id]; // Expired!
        } else {
          updatedCards[p.id] = { ...activeC, racesLeft: nextVal };
        }
      }
    });

    setMultiplayerCards(updatedCards);
    setSimulationResult(clonedRes);
    
    // Draw 3 fresh support cards for the pool of next selections
    const shuffled = [...BUFF_CARDS].sort(() => 0.5 - Math.random());
    setAvailableCards(shuffled.slice(0, 3));

    // Proceed to standard GP intro loop so they can click "ABRIR SESSÃO DE CLASSIFICAÇÃO"
    setSimPhase('intro');
    triggerToast('⚙️ Telemetria de Estratégias Gravadas! Prontos para Qualificação!');
    playBeep(880, 0.15);
  };

  // Start the 2-Phase Live GP Simulation
  const handleStartGP = (gpIdx: number, resultsObj?: any) => {
    const activeRes = resultsObj || simulationResult;
    if (!activeRes) return;

    setSimGpIdx(gpIdx);
    setSimActiveRaceIdx(gpIdx);
    setSimRaceCompleted(false);
    setSimPhase(isMultiplayer ? 'strategy' : 'intro');
    setSimRaceLap(0);
    setSimYellowFlag(false);

    if (isMultiplayer) {
      const defaultStrats: Record<number, string> = {};
      multiplayerPlayers.forEach(p => {
        defaultStrats[p.id] = 'equilibrada';
      });
      setMultiplayerStrategies(defaultStrats);
    }
    setSimYellowFlagMessage('');

    const gpPositions = activeRes.raceResults[gpIdx].positions;
    const circuitInfo = CIRCUITS[gpIdx];
    const climateLabel = circuitInfo.isWet ? '🌧️ CHUVA PESADA' : '☀️ TEMPO LIMPO';
    const typeLabel = circuitInfo.type.toUpperCase();
    
    // 1. Initialize Ticker Logs
    const initialLogs = [
      `📍 GP de ${circuitInfo.name.replace('Grande Prêmio do ', '').replace('Grande Prêmio de ', '')} - Sintonizando transmissor de mureta.`,
      `🏁 Estilo de Pista: ${typeLabel} | Condição Climática: ${climateLabel}.`,
      `⚙️ Telemetria calibrada. Pilotos posicionados para a sessão de Classificação!`,
    ];
    setSimTickerLogs(initialLogs);

    // 2. Generate Quali data derived from pre-calculated GP positions
    let tempQualiList = gpPositions.map((p: any, idx: number) => {
      const isDnf = p.dnf;
      const qualiRank = isDnf ? (idx + Math.floor(Math.random() * 4)) : idx;
      const baseSecs = 68.2 + (qualiRank * 0.38) + (Math.random() * 1.3);
      
      const s1Val = (baseSecs * 0.31 + (Math.random() - 0.5) * 0.12).toFixed(3);
      const s2Val = (baseSecs * 0.40 + (Math.random() - 0.5) * 0.16).toFixed(3);
      const s3Val = (baseSecs * 0.29 + (Math.random() - 0.5) * 0.11).toFixed(3);

      const minutes = Math.floor(baseSecs / 60);
      const secondsAndMillis = (baseSecs % 60).toFixed(3);
      const qualiTimeStr = `${minutes}:${secondsAndMillis.padStart(6, '0')}`;

      return {
        driver: p.driver,
        team: p.team,
        color: p.color,
        qualiCompleted: false,
        rawTime: baseSecs,
        qualiTimeStr,
        s1: s1Val,
        s2: s2Val,
        s3: s3Val,
        s1Status: 'yellow',
        s2Status: 'yellow',
        s3Status: 'yellow',
        dnf: p.dnf,
        incident: p.incident
      };
    });

    // Sort to determine grid order and pole sitter
    tempQualiList.sort((a, b) => a.rawTime - b.rawTime);

    // Calculate diffs
    const bestTempSecs = tempQualiList[0].rawTime;
    tempQualiList = tempQualiList.map((item, idx) => {
      return {
        ...item,
        qualiDiff: idx === 0 ? 'POLE' : `+${(item.rawTime - bestTempSecs).toFixed(3)}s`
      };
    });

    setSimQualiLeaderboard(tempQualiList);
    setSimQualiActiveDriverIndex(0);
    setSimQualiActiveDriverDelta(null);
  };

  // Advance Qualifying session by completing one driver's lap on screen
  const tickQualifying = () => {
    if (simQualiActiveDriverIndex >= simQualiLeaderboard.length) {
      // Finished all drivers! Change to finished_quali stage
      setSimPhase('finished_quali');
      playBeep(880, 0.4);
      setSimTickerLogs(prev => [
        `🚥 Treino Classificatório ENCERRADO!`,
        `🏆 Pole Position garantida para ${simQualiLeaderboard[0]?.driver} (${simQualiLeaderboard[0]?.team}) com tempo de ${simQualiLeaderboard[0]?.qualiTimeStr}!`,
        `⚙️ Próximo passo: Ajustar cargas aerodinâmicas e alinhar no grid de largada.`,
        ...prev
      ]);
      return;
    }

    const currentIdx = simQualiActiveDriverIndex;
    const driverEntry = simQualiLeaderboard[currentIdx];

    // Mark current driver as completed in the leaderboard
    const updatedLeaderboard = simQualiLeaderboard.map((d, dIdx) => {
      if (dIdx === currentIdx) {
        const s1Status = Math.random() < 0.2 ? 'purple' : (Math.random() < 0.5 ? 'green' : 'yellow');
        const s2Status = Math.random() < 0.2 ? 'purple' : (Math.random() < 0.5 ? 'green' : 'yellow');
        const s3Status = Math.random() < 0.2 ? 'purple' : (Math.random() < 0.5 ? 'green' : 'yellow');
        
        return {
          ...d,
          qualiCompleted: true,
          s1Status,
          s2Status,
          s3Status
        };
      }
      return d;
    });

    setSimQualiLeaderboard(updatedLeaderboard);
    setSimQualiActiveDriverIndex(currentIdx + 1);

    // Generate telemetry
    setSimTelemetryValues(prev => ({
      ...prev,
      [driverEntry.driver]: {
        speed: 295 + Math.floor(Math.random() * 35),
        gear: 7 + Math.floor(Math.random() * 2),
        rpm: 12200 + Math.floor(Math.random() * 1400),
        throttle: 100,
        brake: 0,
        drs: Math.random() < 0.5,
        temp: 102 + Math.floor(Math.random() * 10)
      }
    }));

    setSimTickerLogs(prev => [
      `⏱️ VOLTA COMPLETA: ${driverEntry.driver} fecha com tempo de ${driverEntry.qualiTimeStr} (${driverEntry.qualiDiff}).`,
      `🟢 Setores de ${driverEntry.driver}: S1: ${driverEntry.s1}s | S2: ${driverEntry.s2}s | S3: ${driverEntry.s3}s.`,
      ...prev
    ]);

    playBeep(650 + currentIdx * 35, 0.08);
  };

  // Convert qualifying results into live race starting positions and run starting lights
  const startRaceLightsAndGrid = () => {
    setSimPhase('race_lights');
    setSimLightsCount(0);
    setSimRaceLap(0);
    setSimYellowFlag(false);
    setSimYellowFlagMessage('');

    // Prepopulate starting grid to map Quali standing
    const startingGrid = simQualiLeaderboard.map((qd, posIdx) => {
      return {
        driver: qd.driver,
        team: qd.team,
        color: qd.color,
        isDnf: false,
        sortingScore: posIdx,
        speed: 0,
        gear: 0,
        rpm: 0,
        throttle: 0,
        brake: 0,
        drsActive: false,
        engineTemp: 85
      };
    });

    setSimRaceLeaderboard(startingGrid);

    // Run lights countdown animation
    let lightTimer = 0;
    const interval = setInterval(() => {
      lightTimer += 1;
      setSimLightsCount(lightTimer);
      playBeep(520, 0.1);

      if (lightTimer === 5) {
        clearInterval(interval);
        setTimeout(() => {
          setSimLightsCount(6);
          setSimPhase('race');
          setSimRaceLap(1);
          playBeep(1000, 0.45);
          setSimTickerLogs(prev => [
            `🟢 LARGADA AUTORIZADA! As luzes vermelhas se apagaram!`,
            ...prev
          ]);
        }, 1200);
      }
    }, 700);
  };

  // Live race timer loop step
  const tickRaceLap = () => {
    const nextLap = simRaceLap + 1;
    if (nextLap > 50) {
      setSimPhase('finished_race');
      setSimYellowFlag(false);
      playBeep(987, 0.4);

      const isFinalGP = simGpIdx === CIRCUITS.length - 1;
      if (isFinalGP) {
        setSimRaceCompleted(true);
      }

      setSimTickerLogs(prev => [
        `🏁 BANDEIRA QUADRICULADA! Corrida finalizada sob festa nos boxes!`,
        `🏆 PÓDIO DEFINIDO: 1º ${simRaceLeaderboard[0]?.driver} | 2º ${simRaceLeaderboard[1]?.driver} | 3º ${simRaceLeaderboard[2]?.driver}!`,
        ...prev
      ]);
      return;
    }

    setSimRaceLap(nextLap);

    const precomputedResult = simulationResult.raceResults[simGpIdx];
    if (!precomputedResult) return;

    const finalPositions = precomputedResult.positions;

    let updatedRaceLeaderboard = simRaceLeaderboard.map(driverState => {
      const qualiIdx = simQualiLeaderboard.findIndex(q => q.driver === driverState.driver);
      const startPos = qualiIdx !== -1 ? qualiIdx : 5;

      const finalIdx = finalPositions.findIndex(f => f.driver === driverState.driver);
      const actualFinalIdx = finalIdx !== -1 ? finalIdx : 6;

      const finalDriverObj = finalPositions[actualFinalIdx];

      const progress = nextLap / 50;
      const intermediateScore = startPos + (actualFinalIdx - startPos) * progress + (Math.random() - 0.5) * 1.8;

      let isDnf = driverState.isDnf;
      if (finalDriverObj?.dnf && !isDnf) {
        const dnfTriggerLap = 3 + (finalIdx % 45);
        if (nextLap >= dnfTriggerLap) {
          isDnf = true;
          setSimYellowFlag(true);
          setSimYellowFlagMessage(`🚨 COLISÃO! ${driverState.driver} abandonou!`);
          setSimTickerLogs(prev => [
            `💥 ACIDENTE! ${driverState.driver} (${driverState.team}) bateu na curva e abandonou a prova! Motivo: ${finalDriverObj.incident || 'Superaquecimento mecânico'}.`,
            ...prev
          ]);
        }
      }

      return {
        ...driverState,
        isDnf,
        incident: finalDriverObj?.incident,
        sortingScore: isDnf ? 999 : intermediateScore
      };
    });

    updatedRaceLeaderboard.sort((a, b) => a.sortingScore - b.sortingScore);
    setSimRaceLeaderboard(updatedRaceLeaderboard);

    const leader = updatedRaceLeaderboard[0];
    const userBest = updatedRaceLeaderboard.find(d => isTeamUser(d.team));

    const commentaries = [
      `🏎️ Lap ${nextLap}/50: Posições mudando na pista! Líder ${leader.driver} acelera forte.`,
      userBest ? `📊 Seu carro (${userBest.driver}) se posiciona provisoriamente em P${updatedRaceLeaderboard.findIndex(d => d.driver === userBest.driver) + 1}.` : `🔋 Telemetria mostra desgaste acentuado de pneus para o pelotão.`,
    ];

    if (nextLap === 1) {
      commentaries.unshift(`🚦 LARGADA AUTORIZADA! ${leader.driver} faz excelente largada sob ronco de motores!`);
    } else if (nextLap === 25) {
      commentaries.unshift(`⚡ Volta 25: Metade da corrida! Desgaste de pneus e estratégias de pit stop acionadas.`);
    } else if (nextLap === 50) {
      commentaries.unshift(`🏁 VOLTA FINAL! Disputa metro a metro por pontos cruciais do campeonato!`);
    }

    setSimTickerLogs(prev => [...commentaries, ...prev]);
    playBeep(494, 0.08);
  };

  // Chrono simulation orchestrator (Compatibility placeholder)
  const runStepByStepGPs = (resultsObj?: any) => {
    handleStartGP(0, resultsObj);
  };

  useEffect(() => {
    if (gameMode !== 'simulating' || !simIsPlaying) return;

    const baseInterval = simPhase === 'race' ? 200 : 1000;
    const currentInterval = baseInterval / simSpeed;

    const intervalId = setInterval(() => {
      if (simPhase === 'quali') {
        tickQualifying();
      } else if (simPhase === 'race') {
        tickRaceLap();
      }
    }, currentInterval);

    return () => clearInterval(intervalId);
  }, [gameMode, simIsPlaying, simPhase, simSpeed, simQualiActiveDriverIndex, simRaceLap, simQualiLeaderboard, simRaceLeaderboard]);

  useEffect(() => {
    if (gameMode !== 'simulating' || !simIsPlaying || simPhase !== 'race') return;

    const intervalId = setInterval(() => {
      setSimTelemetryValues(prev => {
        const next = { ...prev };
        simRaceLeaderboard.forEach(d => {
          if (d.isDnf) {
            next[d.driver] = { speed: 0, gear: 0, rpm: 0, throttle: 0, brake: 0, drs: false, temp: 85 };
          } else {
            const currentSpeed = next[d.driver]?.speed || (280 + Math.floor(Math.random() * 40));
            const isCorner = Math.random() < 0.25;
            let speed = currentSpeed;
            let gear = next[d.driver]?.gear || 7;
            let throttle = 100;
            let brake = 0;
            let rpm = 12500 + Math.floor(Math.random() * 1500);

            if (isCorner) {
              speed = 100 + Math.floor(Math.random() * 80);
              gear = 2 + Math.floor(Math.random() * 2);
              throttle = 15 + Math.floor(Math.random() * 20);
              brake = 70 + Math.floor(Math.random() * 30);
              rpm = 8500 + Math.floor(Math.random() * 2000);
            } else {
              speed = 280 + Math.floor(Math.random() * 55);
              gear = 6 + Math.floor(Math.random() * 2);
              throttle = 90 + Math.floor(Math.random() * 10);
              brake = 0;
            }

            next[d.driver] = {
              speed,
              gear,
              rpm,
              throttle,
              brake,
              drs: speed > 290 && Math.random() < 0.35,
              temp: 110 + Math.floor(Math.random() * 14)
            };
          }
        });
        return next;
      });
    }, 180);

    return () => clearInterval(intervalId);
  }, [gameMode, simIsPlaying, simPhase, simRaceLeaderboard]);

  // Recalculate standings on-the-fly when support/buff cards are applied
  const recalculateStandingsFromRaces = (raceResults: any[]) => {
    const pointsList = [10, 8, 6, 5, 4, 3, 2, 1, 0, 0];
    const driverStandingsMap: Record<string, { points: number; wins: number; podiums: number; dnfCount: number; team: string; color: string; isUser: boolean }> = {};
    const teamStandingsMap: Record<string, number> = {};

    // Get all initial drivers and teams from the first race to initialize the maps
    if (raceResults.length > 0) {
      raceResults[0].positions.forEach((p: any) => {
        const dKey = `${p.driver} (${p.team})`;
        driverStandingsMap[dKey] = {
          points: 0,
          wins: 0,
          podiums: 0,
          dnfCount: 0,
          team: p.team,
          color: p.color,
          isUser: isTeamUser(p.team),
        };
        teamStandingsMap[p.team] = 0;
      });
    }

    // Tally points across results
    raceResults.forEach((raceRes) => {
      let finisherIndex = 0;
      raceRes.positions.forEach((p: any) => {
        const dKey = `${p.driver} (${p.team})`;
        const entry = driverStandingsMap[dKey];
        if (entry) {
          if (p.dnf) {
            entry.dnfCount += 1;
            // No points scored
            p.points = 0;
          } else {
            const pts = finisherIndex < 10 ? pointsList[finisherIndex] : 0;
            p.points = pts; // persist
            entry.points += pts;
            teamStandingsMap[p.team] = (teamStandingsMap[p.team] || 0) + pts;
            
            if (finisherIndex === 0) entry.wins += 1;
            if (finisherIndex < 3) entry.podiums += 1;
            finisherIndex++;
          }
        }
      });
    });

    const driverStandings = Object.keys(driverStandingsMap).map(dKeyName => {
      const val = driverStandingsMap[dKeyName];
      return {
        driver: dKeyName.split(' (')[0],
        ...val,
      };
    }).sort((a, b) => b.points - a.points);

    const teamStandings = Object.keys(teamStandingsMap).map(tName => {
      const isU = isTeamUser(tName);
      return {
        team: tName,
        points: teamStandingsMap[tName],
        isUser: isU,
        color: getTeamColor(tName),
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

    const targetPlayer = isMultiplayer
      ? multiplayerPlayers[targetPlayerIdx]
      : null;

    const isTargetTeam = (tName: string) => {
      if (isMultiplayer) {
        return targetPlayer ? targetPlayer.teamName === tName : false;
      }
      return tName === playerTeamName;
    };

    const userDriverEntries = raceRes.positions.filter((p: any) => isTargetTeam(p.team));
    if (userDriverEntries.length === 0) {
      triggerToast('⚠️ Nenhum piloto do seu time encontrado nesta corrida!');
      return;
    }

    // Isolate competitor drivers
    const others = raceRes.positions.filter((p: any) => !isTargetTeam(p.team));

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
      const currentInspectSlots = isMultiplayer
        ? (multiplayerPlayers[targetPlayerIdx]?.slots || {})
        : slots;
      const d1Name = currentInspectSlots['driver_1']?.name || 'Seu Piloto 1';
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
        const rest = raceRes.positions.filter((p: any) => !isTargetTeam(p.team) || !p.dnf);
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
      const currentInspectSlots = isMultiplayer
        ? (multiplayerPlayers[targetPlayerIdx]?.slots || {})
        : slots;
      const d2Name = currentInspectSlots['driver_2']?.name || 'Seu Piloto 2';
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
      slots['engine']?.rating_geral || (slots['engine']?.powerBias ? slots['engine'].powerBias * 10 : 80),
      slots['team_boss']?.rating_geral || 80,
      slots['chassis']?.rating_geral || 80,
      slots['strategist']?.rating_geral || 80,
      slots['engineer']?.rating_geral || 80,
    ];
    const avgRating = Math.round(ratingsArray.reduce((src, val) => src + val, 0) / 8);
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

    // Check if player or multiplayer players lost the standing (position > 1)
    const teamStandings = simulationResult.teamStandings;
    if (isMultiplayer) {
      const bankrupts: string[] = [];
      multiplayerPlayers.forEach(p => {
        const idx = teamStandings.findIndex((t: any) => t.team === p.teamName);
        if (idx > 0 || idx === -1) {
          const pos = idx !== -1 ? idx + 1 : teamStandings.length;
          const pts = idx !== -1 ? teamStandings[idx].points : 0;
          bankrupts.push(`🔴 ${p.name} (${p.teamName}) — Posição #${pos} com ${pts} pts`);
        }
      });

      if (bankrupts.length > 0) {
        setBankruptcyDetails({
          teamName: 'Diversas Escuderias',
          position: 0,
          points: 0,
          isMultiplayer: true,
          playerList: bankrupts
        });
        setBankruptcyModalOpen(true);
      }
    } else {
      const userTeamIdx = teamStandings.findIndex((t: any) => t.isUser);
      if (userTeamIdx > 0 || userTeamIdx === -1) {
        const pos = userTeamIdx !== -1 ? userTeamIdx + 1 : 6;
        const pts = userTeamIdx !== -1 ? teamStandings[userTeamIdx].points : 0;
        setBankruptcyDetails({
          teamName: playerTeamName,
          position: pos,
          points: pts,
          isMultiplayer: false,
          failedStaff: {
            driver_1: slots['driver_1'],
            team_boss: slots['team_boss'],
            chassis: slots['chassis'],
            engineer: slots['engineer']
          }
        });
        setBankruptcyModalOpen(true);
      }
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
        slots['engine']?.rating_geral || (slots['engine']?.powerBias ? slots['engine'].powerBias * 10 : 80),
        slots['team_boss']?.rating_geral || 80,
        slots['chassis']?.rating_geral || 80,
        slots['strategist']?.rating_geral || 80,
        slots['engineer']?.rating_geral || 80,
      ];
      const avgRating = Math.round(ratingsArray.reduce((src, val) => src + val, 0) / 8);
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
    if (!simulationResult || !simulationResult.raceResults || !simulationResult.teamStandings) return [];

    // All active teams in this simulation run
    const teams = simulationResult.teamStandings.map((t: any) => t.team);

    // Cumulative points cache
    const cumulativePoints: Record<string, number> = {};
    teams.forEach(tName => {
      cumulativePoints[tName] = 0;
    });

    return simulationResult.raceResults.map((raceResult: any, idx: number) => {
      const shortGpName = raceResult.raceName
        ? raceResult.raceName
            .replace('Grande Prêmio do ', 'GP ')
            .replace('Grande Prêmio da ', 'GP ')
            .replace('Grande Prêmio de ', 'GP ')
            .replace('Grande Prêmio ', 'GP ')
        : `Etapa ${idx + 1}`;

      const stepData: Record<string, any> = {
        stage: idx + 1,
        name: shortGpName,
      };

      teams.forEach(tName => {
        const racePoints = raceResult.positions
          .filter((p: any) => p.team === tName)
          .reduce((sum: number, p: any) => sum + p.points, 0);

        cumulativePoints[tName] += racePoints;
        stepData[tName] = cumulativePoints[tName];
      });

      return stepData;
    });
  }, [simulationResult]);

  // Average Rating
  const activeAvgRating = (customSlots?: Record<string, any>) => {
    const targetSlots = customSlots || slots;
    const keys = Object.keys(targetSlots).filter(k => targetSlots[k] !== null && targetSlots[k] !== undefined);
    if (keys.length === 0) return 0;
    const sum = keys.reduce((acc, k) => {
      const item = targetSlots[k];
      const rating = item?.rating_geral || (item?.powerBias ? item.powerBias * 10 : 80);
      return acc + rating;
    }, 0);
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
    const anyDriverSlotEmpty = GAME_SLOTS.some(s => s.id.includes('driver') || s.id === 'reserve_1') && 
      !GAME_SLOTS.filter(s => s.id.includes('driver') || s.id === 'reserve_1').every(s => slots[s.id]);

    const isSlotEmpty = (id: string) => !slots[id];

    // Read current team items
    const drivers = [
      slots['driver_1'],
      slots['driver_2'],
      slots['reserve_1'],
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
      if (isSlotEmpty('engine')) {
        tips.push({
          id: 'engine_tactical',
          title: 'Unidade de Potência / Motor ⚡',
          description: 'O motor determina a velocidade máxima em retas e arrancadas rápidas. Garanta um ótimo motor (Mercedes ou Ferrari) para decolar no grid.',
          priority: 'baixa',
          targetSlotId: 'engine',
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

  const filteredTeamsMeta = TEAMS_META.filter(team => {
    if (!encyclopediaSearch) return true;
    const q = encyclopediaSearch.toLowerCase();
    return (
      team.name.toLowerCase().includes(q) ||
      team.country.toLowerCase().includes(q) ||
      team.notes.toLowerCase().includes(q) ||
      (team.reputationTags && team.reputationTags.some((tag: string) => tag.toLowerCase().includes(q))) ||
      team.tier.toLowerCase().includes(q)
    );
  });

  const filteredDriversMeta = DRIVERS_META.filter(drv => {
    if (!encyclopediaSearch) return true;
    const q = encyclopediaSearch.toLowerCase();
    return (
      drv.name.toLowerCase().includes(q) ||
      drv.country.toLowerCase().includes(q) ||
      drv.notes.toLowerCase().includes(q) ||
      (drv.styleTags && drv.styleTags.some((tag: string) => tag.toLowerCase().includes(q))) ||
      drv.tier.toLowerCase().includes(q)
    );
  });

  const filteredEngineersMeta = ENGINEERS_META.filter(eng => {
    if (!encyclopediaSearch) return true;
    const q = encyclopediaSearch.toLowerCase();
    return (
      eng.name.toLowerCase().includes(q) ||
      eng.notes.toLowerCase().includes(q) ||
      (eng.teams && eng.teams.some((teamName: string) => teamName.toLowerCase().includes(q))) ||
      (eng.reputationTags && eng.reputationTags.some((tag: string) => tag.toLowerCase().includes(q))) ||
      eng.tier.toLowerCase().includes(q)
    );
  });

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

              {/* Callout do Museu da F1 */}
              <div className="bg-gradient-to-r from-red-950/20 via-neutral-900/40 to-neutral-900/10 border border-neutral-800 p-4 rounded flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 max-w-3xl">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-mono text-[#FF1801] tracking-widest font-bold uppercase block">⚡ MARAVILHAS DOS DADOS PADDOCK</span>
                  <h4 className="text-sm font-display font-medium text-white tracking-tight">Museu F1 de Construtores &amp; Pilotos Memoráveis</h4>
                  <p className="text-[11px] text-[#888] font-sans">
                    Navegue por perfis detalhados de construtores históricos, pilotos GOATs, designers e memes icônicos da F1 que abastecem as cartas de draft e as estatísticas de simulação do jogo.
                  </p>
                </div>
                <button
                  id="btn_open_encyclopedia_home"
                  onClick={() => {
                    setHistoryEncyclopediaOpen(true);
                    playBeep(523, 0.1);
                  }}
                  className="bg-[#151515] hover:bg-[#222] text-neutral-200 border border-neutral-700 hover:border-[#FF1801] font-display font-bold text-xs px-5 py-2.5 rounded transition-all cursor-pointer whitespace-nowrap active:scale-95 text-center flex items-center space-x-1.5 hover:shadow-[0_0_15px_rgba(255,24,1,0.15)]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#FF1801]" />
                  <span>PORTAL DE DADOS F1</span>
                </button>
              </div>

              {/* Informação rápida de rodagem */}
              <div className="grid grid-cols-3 gap-6 border-t border-[#222] pt-6 max-w-lg text-xs font-mono">
                <div>
                  <span className="block text-[#666] uppercase font-bold text-[10px]">CORRIDAS</span>
                  <span className="text-white font-bold text-base block mt-0.5">{CIRCUITS.length} GPs do Calendário</span>
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
              
              {/* ==================== WIDGET DA GARAGEM DE CUSTOMIZAÇÃO & MULTIPLAYER ==================== */}
              <div className="bg-[#111] border border-neutral-800 rounded p-4 space-y-4 shadow-md">
                <div className="flex items-center space-x-2 border-b border-neutral-800 pb-2.5">
                  <Wrench className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                  <h3 className="font-display font-medium uppercase tracking-wider text-neutral-200 text-xs">
                    Garagem de Customização & Multiplayer
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-400 block uppercase">NOME DA SUA EQUIPE</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="input_player_team_name"
                        value={playerTeamName}
                        onChange={(e) => {
                          const val = e.target.value.substring(0, 24);
                          setPlayerTeamName(val);
                          sessionStorage.setItem('f1_player_team_name', val);
                        }}
                        onFocus={() => setIsTeamNameInputFocused(true)}
                        onBlur={() => setIsTeamNameInputFocused(false)}
                        placeholder="Ex: Massa GP"
                        className="w-full bg-black/60 border border-neutral-800 pl-2.5 pr-8 py-1.5 rounded text-xs text-white focus:outline-none transition-all duration-300 focus:border-[#FF1801] focus:ring-1 focus:ring-[#FF1801]/30 focus:shadow-[0_0_12px_rgba(255,24,1,0.25)]"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
                        <Cpu className={`h-3.5 w-3.5 transition-all duration-300 ${isTeamNameInputFocused ? 'text-[#FF1801] opacity-90 animate-pulse' : 'text-neutral-600 opacity-40'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-400 block uppercase">COR REPRESENTATIVA</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        id="input_player_team_color"
                        value={playerTeamColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlayerTeamColor(val);
                          sessionStorage.setItem('f1_player_team_color', val);
                        }}
                        className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer outline-none shrink-0"
                      />
                      <input
                        type="text"
                        value={playerTeamColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlayerTeamColor(val);
                          sessionStorage.setItem('f1_player_team_color', val);
                        }}
                        className="w-full bg-black/60 border border-neutral-800 focus:border-[#FF1801]/60 px-2.5 py-1.5 rounded text-[10px] font-mono uppercase text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Racing color presets shortcuts */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[9px] font-mono text-neutral-500 block uppercase">Atalhos de Escuderias Clássicas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Ferrari', color: '#FF1801' },
                      { name: 'McLaren', color: '#FF8700' },
                      { name: 'Red Bull', color: '#0C1623' },
                      { name: 'Mercedes', color: '#00A398' },
                      { name: 'Aston', color: '#006F62' },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setPlayerTeamColor(preset.color);
                          sessionStorage.setItem('f1_player_team_color', preset.color);
                          playBeep(520, 0.05);
                        }}
                        className="px-2 py-0.5 bg-black/40 hover:bg-black/85 hover:border-neutral-700 transition-colors border border-neutral-800 rounded-sm text-[9px] font-mono text-neutral-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: preset.color }}></span>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multiplayer Section Call-To-Action */}
                <div className="border-t border-neutral-800 pt-3">
                  <button
                    id="btn_open_multiplayer_setup"
                    onClick={() => {
                      setMultiSetupOpen(true);
                      playBeep(440, 0.1);
                    }}
                    className="w-full bg-[#FF1801]/10 hover:bg-[#FF1801]/25 border border-[#FF1801]/40 hover:border-[#FF1801] text-white font-display font-medium py-3 rounded-md text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,24,1,0.05)] uppercase"
                  >
                    <Users className="h-4.5 w-4.5 text-[#FF1801] animate-pulse" />
                    <span>Iniciar Draft Multiplayer (Até 4 Jogadores)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 border-b border-[#222] pb-3 pt-2">
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
          <div className="space-y-4 w-full">
            {/* Multiplayer Tab Selector Bar */}
            {isMultiplayer && (
              <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#222] pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#FF1801] animate-pulse" />
                    <span className="font-display font-medium text-[11px] uppercase tracking-wider text-neutral-300">
                      Painel de Controle de Draft Simultâneo
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500">Clique para alternar e gerenciar cada escuderia livremente</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {multiplayerPlayers.map((player, idx) => {
                    const isActive = idx === activeMultiPlayerIndex;
                    const filledCount = Object.keys(player.slots).length;
                    const isFullyDrafted = filledCount === 10;
                    
                    return (
                      <button
                        key={player.id}
                        onClick={() => {
                          setActivePlayer(idx);
                          playBeep(440 + idx * 50, 0.08);
                        }}
                        className={`p-2.5 rounded text-left transition-all border relative cursor-pointer ${
                          isActive
                            ? 'bg-neutral-800/60 border-neutral-700 text-white shadow'
                            : 'bg-black/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                        style={{
                          borderLeft: `4px solid ${player.color}`,
                          boxShadow: isActive ? `0 0 10px ${player.color}20` : 'none'
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-[11px] uppercase tracking-tight block truncate max-w-[80%] text-neutral-100">
                            {player.name}
                          </span>
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: player.color }}
                          ></span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400 leading-none">
                          <span className="truncate max-w-[70%]">{player.teamName}</span>
                          <span className={`font-bold ${isFullyDrafted ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {filledCount}/10
                          </span>
                        </div>
                        
                        {isFullyDrafted && (
                          <div className="absolute top-1 right-1 text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded border border-emerald-500/20 font-bold">
                            🏁 OK
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                    
                    {/* Filtro Restritivo de Contratos */}
                    <div className="bg-[#111] border border-[#222] p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-gray-300 block uppercase tracking-wider text-[9px] font-mono mb-0.5">
                          🛡️ Restrição do Cockpit (Licença Paddock)
                        </span>
                        <p className="text-[10px] text-[#777] font-sans leading-tight">
                          {restrictiveMode === 'none' && "Paddock Aberto: Todos os pilotos do sorteio estão elegíveis para contratação."}
                          {restrictiveMode === 'elite' && "Super Licença Elite: Apenas pilotos com rating >= 83 ou títulos de renome podem assinar."}
                          {restrictiveMode === 'no-meme' && "Foco Profissional: Pilotos meme ou amadores com rating < 60 estão suspensos."}
                          {restrictiveMode === 'only-meme' && "Desafio Renegados: Apenas pilotos meme ou fundo de grid são elegíveis!"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 w-full sm:w-auto">
                        <select
                          id="select_restrictive_mode"
                          value={restrictiveMode}
                          onChange={(e) => {
                            setRestrictiveMode(e.target.value as any);
                            playBeep(600, 0.08);
                          }}
                          className="bg-[#050505]/80 border border-[#333] text-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-[#FF1801] text-xs font-mono w-full sm:w-auto cursor-pointer"
                        >
                          <option value="none">🔓 Paddock Aberto (Todos)</option>
                          <option value="elite">👑 Super Licença Elite (GOATs)</option>
                          <option value="no-meme">🛡️ Sem Pilotos Meme (Rating &gt;= 60)</option>
                          <option value="only-meme">🤡 Apenas Pilotos Meme (Rating &lt; 80)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidates.map((cand) => {
                        const slotId = GAME_SLOTS[activeSlotIndex]?.id;
                        const currentComboNames = detectCombos(slots).map(c => c.name);
                        const simulatedCombos = slotId ? detectCombos({ ...slots, [slotId]: cand }) : [];
                        const activatedCombos = simulatedCombos.filter(c => !currentComboNames.includes(c.name));
                        const isRestricted = isCandidateRestricted(cand);

                        return (
                          <div
                            key={cand.id || cand.name}
                            id={`candidate_card_${cand.id || cand.name}`}
                            onClick={() => handleSelectCandidate(cand)}
                            className={`bg-[#050505] border hover:bg-[#111]/30 rounded p-4 cursor-pointer transition-all text-left flex flex-col justify-between ${
                              isRestricted
                                ? 'opacity-30 border-red-950/45 bg-red-950/5 cursor-not-allowed hover:border-red-950'
                                : 'border-[#222] hover:border-[#FF1801] hover:scale-[1.02] active:scale-95 group'
                            }`}
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

                                {isRestricted ? (
                                  <span className="bg-red-950/80 border border-red-800 text-[#FF1801] font-mono font-bold text-[10px] px-2 py-0.5 rounded-sm flex items-center space-x-1">
                                    <Lock className="h-2.5 w-2.5 inline text-[#FF1801]" />
                                    <span>LICENÇA RESTRITA</span>
                                  </span>
                                ) : difficultyMode === 'normal' ? (
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
          </div>
        )}

        {/* ==================== 3. TELA DE SIMULAÇÃO (START LIGHTS & GP CALENDAR) ==================== */}
        {gameMode === 'simulating' && (
          <div id="screen_simulating" className="max-w-5xl w-full mx-auto bg-[#070707] border border-[#222] rounded-lg p-5 sm:p-6 space-y-6 shadow-2xl my-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-3 text-[8px] text-[#555] font-mono uppercase tracking-widest leading-none">Paddock Command Broadcast Engine v3.0</div>
            
            {/* INITIAL OVERALL START LIGHTS COUNTDOWN */}
            {simActiveRaceIdx === -1 && (
              <div className="space-y-6 text-center py-10">
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest block">LARGADA DO CAMPEONATO MUNDIAL F1 DRAFT</span>
                
                {/* As 5 luzes do semáforo da F1 */}
                <div className="flex justify-center space-x-4 py-6 bg-black/60 rounded border border-[#222] max-w-sm mx-auto">
                  {[1, 2, 3, 4, 5].map((lightNum) => {
                    const isOn = simLightsCount >= lightNum && simLightsCount < 6;
                    return (
                      <div key={lightNum} className="flex flex-col items-center space-y-2">
                        <div className="bg-[#1C0506] border border-[#331112] p-1 rounded-full">
                          <div className={`h-10 w-10 rounded-full transition-all duration-100 ${
                            isOn 
                              ? 'bg-[#FF1801] shadow-[0_0_20px_#FF1801] border border-[#FF1801]' 
                              : 'bg-stone-900 border border-stone-950'
                          }`} />
                        </div>
                        <div className="h-2 w-2 rounded-full bg-[#111]" />
                      </div>
                    );
                  })}
                </div>

                {simLightsCount < 6 ? (
                  <p className="text-xs text-[#FF1801] font-mono tracking-wider animate-pulse uppercase">Sincronizando telemetria global...</p>
                ) : (
                  <p className="text-sm font-display font-medium text-green-500 tracking-wide uppercase italic">SINAL VERDE! SISTEMA ATIVO!</p>
                )}
              </div>
            )}

            {/* LIVE MULTI-PHASE SYSTEM FOR THE CURRENT ACTIVE GP */}
            {simActiveRaceIdx >= 0 && (
              <div className="space-y-6">
                
                {/* BRANDING HEADER WITH ACTIVE CIRCUIT INFO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 border border-neutral-900 p-4 rounded-md">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-[#FF1801] text-white font-mono text-[9px] font-bold uppercase rounded-sm">
                        ETAPA {simGpIdx + 1} DE {CIRCUITS.length}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono font-semibold">
                        {CIRCUITS[simGpIdx]?.type?.toUpperCase()} STYLE
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mt-1">
                      {CIRCUITS[simGpIdx]?.name}
                    </h2>
                  </div>

                  <div className="flex gap-3 text-xs font-mono">
                    <div className="bg-[#111] border border-neutral-800 px-3 py-1.5 rounded text-neutral-300 flex items-center space-x-2">
                      <span>Clima:</span>
                      <span className="font-bold flex items-center">
                        {CIRCUITS[simGpIdx]?.isWet ? (
                          <span className="text-sky-400 flex items-center gap-1">🌧️ MOLHADO (Pista Lisa)</span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">☀️ SECO / ESTÁVEL</span>
                        )}
                      </span>
                    </div>

                    <div className="bg-[#111] border border-neutral-800 px-3 py-1.5 rounded text-neutral-300 flex items-center space-x-2">
                      <span>Fase Ativa:</span>
                      <span className="font-bold text-[#FF1801] uppercase tracking-wider animate-pulse">
                        {simPhase === 'intro' && 'PREVIEW'}
                        {simPhase === 'quali' && 'CLASSIFICAÇÃO'}
                        {simPhase === 'finished_quali' && 'GRID DE LARGADA'}
                        {simPhase === 'race_lights' && 'ALINHAMENTO'}
                        {simPhase === 'race' && `CORRIDA LIVE - LAP ${simRaceLap}/50`}
                        {simPhase === 'finished_race' && 'GP FINALIZADO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SIMULATION PLAYBACK COMMAND PANEL */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C0C0C]/90 border border-[#222] px-4 py-3 rounded-md">
                  
                  {/* Playback Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSimIsPlaying(!simIsPlaying)}
                      className={`px-3 py-2 text-xs font-mono font-bold rounded flex items-center space-x-1.5 cursor-pointer border transition-all ${
                        simIsPlaying 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black shadow-md' 
                          : 'bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500 hover:text-black shadow-md'
                      }`}
                    >
                      {simIsPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span>{simIsPlaying ? 'PAUSAR' : 'EXECUTAR'}</span>
                    </button>

                    <div className="flex items-center bg-[#111] rounded border border-neutral-800 p-0.5">
                      {[1, 2, 4, 8].map((speedVal) => (
                        <button
                          key={speedVal}
                          type="button"
                          onClick={() => setSimSpeed(speedVal)}
                          className={`px-2 py-1 text-[10px] font-mono font-bold rounded-sm cursor-pointer transition-all ${
                            simSpeed === speedVal 
                              ? 'bg-[#FF1801] text-white shadow-inner' 
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {speedVal}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Immediate skip actions to ensure control */}
                  <div className="flex items-center space-x-2">
                    {simPhase === 'quali' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSimPhase('finished_quali');
                          playBeep(800, 0.25);
                          setSimQualiLeaderboard(prev => prev.map(item => ({ ...item, qualiCompleted: true })));
                          setSimQualiActiveDriverIndex(simQualiLeaderboard.length);
                          setSimTickerLogs(p => ['⏭️ Qualificação pulada para final.', ...p]);
                        }}
                        className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 px-3 py-1.5 rounded text-[10px] font-mono font-bold text-neutral-300 cursor-pointer"
                      >
                        Pular Quali ⏱️
                      </button>
                    )}

                    {simPhase === 'race' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSimPhase('finished_race');
                          setSimRaceLap(50);
                          setSimYellowFlag(false);
                          playBeep(987, 0.4);
                          const finalPositions = simulationResult.raceResults[simGpIdx].positions;
                          const mappedGrid = finalPositions.map((p: any, posIdx: number) => ({
                            driver: p.driver,
                            team: p.team,
                            color: p.color,
                            isDnf: p.dnf,
                            incident: p.incident,
                            sortingScore: posIdx
                          }));
                          setSimRaceLeaderboard(mappedGrid);
                          if (simGpIdx === CIRCUITS.length - 1) {
                            setSimRaceCompleted(true);
                          }
                          setSimTickerLogs(p => ['⏭️ Corrida pulada para bandeirada final.', ...p]);
                        }}
                        className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 px-3 py-1.5 rounded text-[10px] font-mono font-bold text-neutral-300 cursor-pointer"
                      >
                        Ir para Fim 🏁
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        // Instant simulate season
                        setSimRaceCompleted(true);
                        setSimActiveRaceIdx(CIRCUITS.length - 1);
                        setSimGpIdx(CIRCUITS.length - 1);
                        setGameMode('results');
                        handleShowFinalResults();
                      }}
                      className="bg-[#FF1801]/10 border border-[#FF1801]/30 hover:bg-[#FF1801] hover:text-white px-3 py-1.5 rounded text-[10px] font-mono font-bold text-[#FF1801] cursor-pointer transition-all"
                    >
                      Pular Todo Campeonato 🚀
                    </button>
                  </div>
                </div>

                {/* 2-PHASE SCREEN RENDERING AREA */}
                
                {/* PHASE 0: MULTIPLAYER STRATEGY SELECTION */}
                {simPhase === 'strategy' && (
                  <div className="bg-[#0A0A0A] border border-[#222] p-8 rounded-lg space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-[10px] text-zinc-600 font-mono uppercase tracking-widest leading-none">
                      Estratégias de GP
                    </div>

                    <div className="border-b border-[#222] pb-4">
                      <h3 className="text-rose-500 font-mono text-xs uppercase tracking-widest font-bold mb-1">
                        MULTIPLAYER: SALA DE ESTRATÉGIAS & CARTAS
                      </h3>
                      <h4 className="text-3xl font-display font-black text-white leading-tight uppercase font-black">
                        GP {CIRCUITS[simGpIdx]?.name.replace('Grande Prêmio ', '')}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 font-sans">
                        Selecione a estratégia ideal e use ou visualize as cartas de suporte para cada escuderia. Os efeitos de cartas duram por 3 corridas!
                      </p>
                    </div>

                    {/* Circuit info box */}
                    <div className="bg-[#111] p-4 rounded border border-[#222] flex flex-wrap gap-6 items-center justify-between text-xs">
                      <div>
                        <span className="text-[#888] block uppercase font-mono text-[9px] mb-0.5">Estilo do Circuito</span>
                        <span className="text-white font-bold uppercase font-sans">
                          {CIRCUITS[simGpIdx]?.type === 'veloz' && '⚡ Pistas Rápidas (Foco em Reta)'}
                          {CIRCUITS[simGpIdx]?.type === 'rua' && '📐 Circuito de Rua (Foco em Precisão)'}
                          {CIRCUITS[simGpIdx]?.type === 'técnico' && '📐 Circuito Técnico (Curvas Sombrias)'}
                          {CIRCUITS[simGpIdx]?.type === 'clássico' && '🏎️ Tradicional Equilibrado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#888] block uppercase font-mono text-[9px] mb-0.5">Condição Climática</span>
                        <span className="text-white font-bold uppercase font-sans">
                          {CIRCUITS[simGpIdx]?.isWet ? '🌧️ PISTA SE MOLHANDO (Chuva Intensa)' : '☀️ CLIMA SECO (Sol Radiante)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#888] block uppercase font-mono text-[9px] mb-0.5">Vagas na Rodada</span>
                        <span className="text-white font-bold font-mono">GP {simGpIdx + 1} de {CIRCUITS.length}</span>
                      </div>
                    </div>

                    {/* Players grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {multiplayerPlayers.map(player => {
                        const activeC = multiplayerCards[player.id];
                        const strategy = multiplayerStrategies[player.id] || 'equilibrada';

                        return (
                          <div 
                            key={player.id} 
                            style={{ borderLeftColor: player.color }}
                            className="bg-[#151515]/60 border border-[#222] border-l-4 p-5 rounded-md space-y-4 relative"
                          >
                            <div className="flex justify-between items-center">
                              <span 
                                style={{ backgroundColor: player.color + '22', color: player.color }}
                                className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold"
                              >
                                {player.teamName}
                              </span>
                              <span className="text-xs text-white font-bold">{player.name}</span>
                            </div>

                            {/* Select Strategy portion */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono text-neutral-400 block">
                                Escolher Estratégia de Corrida:
                              </label>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {[
                                  { id: 'equilibrada', label: '⚖️ Equilibrada', desc: 'Desempenho nominal e seguro.' },
                                  { id: 'agressiva', label: '🚀 Agressivo', desc: '+7 Ritmo, risca DNF (-15 Confiab.)' },
                                  { id: 'conservadora', label: '🛡️ Conservadora', desc: '-4 Ritmo, +22 Confiabilidade.' },
                                  { id: 'climatica', label: '🌧️ Especialista', desc: '🌧️ +12 em pista molhada, senão -4.' },
                                  { id: 'tecnica', label: '📐 Técnica', desc: '📐 +8 em Rua/Curva, -5 em Reta rápida.' }
                                ].map(opt => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setMultiplayerStrategies(prev => ({ ...prev, [player.id]: opt.id }))}
                                    className={`p-2.5 rounded text-left border transition-all ${
                                      strategy === opt.id
                                        ? 'border-rose-600 bg-rose-950/20 text-white'
                                        : 'border-[#222] bg-[#111] text-zinc-400 hover:border-[#333]'
                                    }`}
                                  >
                                    <div className="font-bold text-[11px] mb-0.5">{opt.label}</div>
                                    <div className="text-[9px] text-[#777] leading-tight font-sans">{opt.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Support Card Portion */}
                            <div className="pt-2 border-t border-[#222] space-y-2">
                              {activeC && activeC.racesLeft > 0 ? (
                                <div className="p-3 bg-neutral-900 border border-[#222] rounded flex justify-between items-center text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-amber-500 text-lg">💡</span>
                                    <div>
                                      <div className="font-bold text-white uppercase text-[10px]">
                                        {BUFF_CARDS.find(b => b.id === activeC.cardId)?.name || activeC.cardId}
                                      </div>
                                      <div className="text-[9px] text-[#777]">Carta ativa para esta escuderia</div>
                                    </div>
                                  </div>
                                  <span className="font-mono text-rose-500 font-bold bg-rose-950/20 px-2 py-0.5 rounded text-[10px]">
                                    {activeC.racesLeft} {activeC.racesLeft === 1 ? 'GP restante' : 'GPs restantes'}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-mono text-[#888] block">
                                    Disparar Nova Carta (Dura 3 GPs):
                                  </label>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {availableCards.map(card => (
                                      <button
                                        key={card.id}
                                        type="button"
                                        onClick={() => {
                                          setMultiplayerCards(prev => ({
                                            ...prev,
                                            [player.id]: { cardId: card.id, racesLeft: 3 }
                                          }));
                                          triggerToast(`💥 ${player.name} ativou buff ${card.name} por 3 corridas!`);
                                        }}
                                        className="p-2 border border-[#222] hover:border-[#444] bg-[#111] hover:bg-[#181818] rounded text-left transition-all group relative animate-fade-in"
                                      >
                                        <div className="font-mono font-bold text-[10px] text-zinc-300 group-hover:text-rose-500 uppercase line-clamp-1">
                                          {card.name}
                                        </div>
                                        <div className="text-[8px] text-[#666] leading-tight font-sans mt-0.5 line-clamp-2">
                                          {card.description}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* MarioKart yo-yo Monte Carlo mode */}
                    <div className="bg-[#111] p-4 rounded border border-[#222] flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🍄</span>
                          <span className="text-white font-mono font-bold text-xs uppercase tracking-wider">
                            Especial MarioKart 2026: CURVA DE MONTECARLO (Modo Yo-Yo)
                          </span>
                        </div>
                        <p className="text-[10px] text-[#777] max-w-2xl font-sans">
                          Efeito Yo-Yo Rubberband! Ativa um simulador probabilístico de Monte Carlo que re-embaralha o grid ciclicamente durante a corrida. Líderes estão sujeitos a Cascos Azuis e retardatários recebem Bullet Bills!
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setMarioKartMode(!marioKartMode);
                            triggerToast(marioKartMode ? '🔴 MarioKart 2026 Inativo' : '🟢 MarioKart 2026 ATIVADO! Monte Carlo liberado!');
                          }}
                          className={`px-4 py-2 text-xs font-mono font-bold rounded uppercase transition-all ${
                            marioKartMode
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {marioKartMode ? 'ATIVADO 🟢' : 'DESATIVADO 🔴'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleConfirmMultiplayerStrategy}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-mono font-extrabold text-xs px-6 py-3 rounded uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg"
                      >
                        <span>🚀 Gravar Estratégia e Iniciar Qualificação</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 1: CIRCUIT PREVIEW / INTRO */}
                {simPhase === 'intro' && (
                  <div className="bg-[#0A0A0A] border border-[#222] p-8 rounded-lg flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 opacity-5">
                      <Trophy className="h-64 h-64 text-white" />
                    </div>
                    
                    <div className="space-y-4 max-w-xl z-10">
                      <h3 className="text-amber-400 font-mono text-xs uppercase tracking-widest leading-none font-bold">FOCANDO PROVA DO CALENDÁRIO</h3>
                      <h4 className="text-3xl font-display font-black text-white leading-tight uppercase">
                        GP {CIRCUITS[simGpIdx]?.name.replace('Grande Prêmio ', '')}
                      </h4>
                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                        Este circuito é conhecido pelas exigências de <strong className="text-white bg-[#111] px-1 py-0.5 rounded font-mono font-bold">{CIRCUITS[simGpIdx]?.type?.toUpperCase()}</strong>. Ajuste os carros do seu paddock! Os pneus e combustíveis estão prontos para a sessão de Classificação Flying Laps para definir o grid oficial.
                      </p>
                      
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setSimPhase('quali')}
                          className="px-5 py-3 bg-[#FF1801] hover:bg-red-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-sm shadow-lg flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Gauge className="h-4 w-4" />
                          <span>ABRIR SESSÃO DE CLASSIFICAÇÃO</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full md:w-64 bg-zinc-950 p-4 rounded border border-neutral-800 space-y-3 z-10 font-mono text-[11px]">
                      <div className="text-neutral-400 uppercase tracking-wider border-b border-neutral-900 pb-1 font-bold">DETALHES DA TELEMETRIA</div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Recorde de Volta:</span>
                        <span className="text-white font-bold">1:{10 + (simGpIdx * 2)}.{312 + (simGpIdx * 10)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Extensão:</span>
                        <span className="text-white font-bold">{(4.3 + (simGpIdx * 0.4)).toFixed(3)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Voltas Simuladas:</span>
                        <span className="text-green-500 font-bold">5 Voltas Curtas</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHASE 2: QUALIFYING SESSION */}
                {simPhase === 'quali' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Leaderboard left */}
                    <div className="lg:col-span-7 bg-[#0A0A0A] border border-neutral-800 p-4 rounded-md space-y-3">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                        <h3 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Gauge className="h-4 w-4 text-sky-400 animate-pulse" />
                          <span>Tempos de Voltas - Classificação</span>
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {simQualiActiveDriverIndex} de {simQualiLeaderboard.length} Pilotos Classificados
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                        {simQualiLeaderboard.map((d, index) => {
                          const isActive = simQualiActiveDriverIndex === index;
                          const isTeamUserDriver = isTeamUser(d.team);
                          return (
                            <div
                              key={`${d.driver}-${d.team}-${index}`}
                              className={`flex items-center justify-between p-2 rounded transition-all text-xs ${
                                isActive 
                                  ? 'bg-[#FF1801]/10 border border-[#FF1801] shadow-[0_0_10px_rgba(255,24,1,0.1)]' 
                                  : 'bg-black/50 border border-neutral-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <span className="font-mono font-bold text-neutral-500 w-5">P{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className={`font-mono font-bold truncate ${isTeamUserDriver ? 'text-amber-400' : 'text-white'}`}>
                                  {d.driver}
                                </span>
                                <span className="text-[10px] text-neutral-400 opacity-80 truncate">{d.team}</span>
                              </div>

                              <div className="flex items-center space-x-3 text-[10px] font-mono font-medium">
                                <div className="flex space-x-1">
                                  <span className={`px-1.5 rounded-sm ${
                                    d.qualiCompleted 
                                      ? (d.s1Status === 'purple' ? 'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-800/40' : d.s1Status === 'green' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-900 border border-neutral-800 text-neutral-400') 
                                      : 'bg-neutral-950 text-neutral-700'
                                  }`}>S1</span>
                                  <span className={`px-1.5 rounded-sm ${
                                    d.qualiCompleted 
                                      ? (d.s2Status === 'purple' ? 'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-800/40' : d.s2Status === 'green' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-900 border border-neutral-800 text-neutral-400') 
                                      : 'bg-neutral-950 text-neutral-700'
                                  }`}>S2</span>
                                  <span className={`px-1.5 rounded-sm ${
                                    d.qualiCompleted 
                                      ? (d.s3Status === 'purple' ? 'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-800/40' : d.s3Status === 'green' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-900 border border-neutral-800 text-neutral-400') 
                                      : 'bg-neutral-950 text-neutral-700'
                                  }`}>S3</span>
                                </div>
                                <span className="text-white font-bold min-w-[55px] text-right">
                                  {d.qualiCompleted ? d.qualiTimeStr : 'RETA OUT'}
                                </span>
                                <span className="text-zinc-500 text-[9px] min-w-[45px] text-right font-bold">
                                  {d.qualiCompleted ? d.qualiDiff : '--'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Onboard fly-lap details */}
                    <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-4 rounded-md flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block border-b border-neutral-900 pb-2 mb-2">
                          🔴 CÂMERA DE MURETA: TELEMETRIA AO VIVO
                        </div>

                        {simQualiActiveDriverIndex < simQualiLeaderboard.length ? (
                          <div className="space-y-4 font-mono">
                            <div className="p-3 bg-zinc-900/60 rounded border border-neutral-800">
                              <span className="text-[9px] text-zinc-500">PILOTO NA CORRIDA ATIVA</span>
                              <div className="text-base text-white font-bold flex items-center space-x-2 mt-1">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: simQualiLeaderboard[simQualiActiveDriverIndex]?.color }} />
                                <span>{simQualiLeaderboard[simQualiActiveDriverIndex]?.driver}</span>
                              </div>
                              <span className="text-[10px] text-zinc-400">{simQualiLeaderboard[simQualiActiveDriverIndex]?.team}</span>
                            </div>

                            {/* Osculating values */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/40 p-3 rounded border border-neutral-900">
                              <div>
                                <span className="text-zinc-500">VELOCIDADE:</span>
                                <div className="text-sm font-bold text-white mt-0.5">
                                  {simTelemetryValues[simQualiLeaderboard[simQualiActiveDriverIndex]?.driver]?.speed || 292} <span className="text-[10px] font-normal text-zinc-400">KM/H</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-zinc-500">ROTAÇÃO RPM:</span>
                                <div className="text-sm font-bold text-white mt-0.5">
                                  {simTelemetryValues[simQualiLeaderboard[simQualiActiveDriverIndex]?.driver]?.rpm || 12450} <span className="text-[10px] font-normal text-zinc-400">RPM</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-zinc-500">MARCHA:</span>
                                <div className="text-sm font-bold text-[#FF1801] mt-0.5">
                                  G{simTelemetryValues[simQualiLeaderboard[simQualiActiveDriverIndex]?.driver]?.gear || 7}
                                </div>
                              </div>
                              <div>
                                <span className="text-zinc-500">ASAS DRS:</span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded mt-0.5 inline-block ${
                                  simTelemetryValues[simQualiLeaderboard[simQualiActiveDriverIndex]?.driver]?.drs 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                    : 'bg-neutral-900 text-neutral-500'
                                }`}>
                                  {simTelemetryValues[simQualiLeaderboard[simQualiActiveDriverIndex]?.driver]?.drs ? 'ATIVADO' : 'INATIVO'}
                                </span>
                              </div>
                            </div>

                            {/* Dual mini bar */}
                            <div className="space-y-2 bg-[#1c1c1c]/20 p-3 rounded border border-neutral-900">
                              <div>
                                <div className="flex justify-between text-[9px] text-zinc-400 font-bold mb-0.5">
                                  <span>ACELERADOR (Throttle)</span>
                                  <span className="text-green-500 font-bold">100%</span>
                                </div>
                                <div className="h-2 bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-[9px] text-zinc-400 font-bold mb-0.5">
                                  <span>FREIO (Brake Pressure)</span>
                                  <span className="text-red-500 font-bold">0%</span>
                                </div>
                                <div className="h-2 bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden">
                                  <div className="h-full bg-red-500" style={{ width: '0%' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 text-neutral-500 italic text-xs font-mono">
                            Qualificando concluído. Alinhando motores!
                          </div>
                        )}
                      </div>

                      {/* Control proceed at quali end */}
                      {simQualiActiveDriverIndex >= simQualiLeaderboard.length && (
                        <button
                          type="button"
                          onClick={startRaceLightsAndGrid}
                          className="w-full py-3 bg-green-500 hover:bg-green-600 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] text-white font-display font-bold text-xs uppercase tracking-widest rounded-sm transition-all"
                        >
                          Ir para o Grid de Largada 🚦
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PHASE 3: COMPLETED QUALIFYING SUMMARY */}
                {simPhase === 'finished_quali' && (
                  <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-md text-amber-200 text-xs font-mono flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-sm uppercase">🏆 POLE POSITION: {simQualiLeaderboard[0]?.driver} do time {simQualiLeaderboard[0]?.team}</div>
                        <p className="text-neutral-300 font-sans">Velocidade absoluta garantindo a mureta interna da turn 1. Todos os 12 pilotos estão prontos!</p>
                      </div>

                      <button
                        type="button"
                        onClick={startRaceLightsAndGrid}
                        className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-mono font-bold tracking-widest uppercase rounded cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1.5 shrink-0"
                      >
                        <Gauge className="h-4 w-4" />
                        <span>LARGAR CORRIDA COLETIVA</span>
                      </button>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-md">
                      <h3 className="font-mono text-zinc-400 text-xs uppercase tracking-widest pb-2 border-b border-neutral-900 mb-2 font-bold">GRID OFICIAL DE PROVA DE TELEMETRIA</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        {simQualiLeaderboard.map((qd, index) => (
                          <div key={`${qd.driver}-${qd.team}-${index}`} className="flex justify-between items-center bg-black/40 p-2 border border-neutral-900 rounded-sm">
                            <div className="flex items-center space-x-2.5 truncate">
                              <span className="font-bold text-neutral-500">G{index + 1}</span>
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: qd.color }} />
                              <span className="truncate text-white font-bold">{qd.driver}</span>
                            </div>
                            <span className="text-zinc-400 font-bold">{qd.qualiTimeStr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* PHASE 4: RACE START LIGHTS */}
                {simPhase === 'race_lights' && (
                  <div className="bg-black/80 border border-neutral-900 p-8 rounded-lg text-center space-y-6 max-w-md mx-auto">
                    <span className="text-[10px] font-mono text-neutral-400 block tracking-widest uppercase">LARGADA AUTORIZADA DO GP</span>
                    
                    <div className="flex justify-center space-x-3 py-6 bg-[#0c0c0c] rounded border border-neutral-850">
                      {[1, 2, 3, 4, 5].map((lightNum) => {
                        const isOn = simLightsCount >= lightNum;
                        return (
                          <div key={lightNum} className="flex flex-col items-center space-y-2">
                            <div className="bg-[#1C0506] border border-[#331112] p-1 rounded-full">
                              <div className={`h-10 w-10 rounded-full transition-all duration-100 ${
                                isOn 
                                  ? 'bg-[#FF1801] shadow-[0_0_20px_#FF1801] border border-[#FF1801]' 
                                  : 'bg-stone-900 border border-stone-950'
                              }`} />
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#111]" />
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-xs font-mono text-[#FF1801] uppercase tracking-wider animate-pulse">ALINHANDO CARROS NO SETOR...</p>
                  </div>
                )}

                {/* PHASE 5: LIVE RACE */}
                {simPhase === 'race' && (
                  <div className="space-y-6">
                    
                    {/* Blink yellow flag banner */}
                    {simYellowFlag && (
                      <div className="bg-yellow-500/10 border border-yellow-500 animate-pulse text-yellow-400 text-xs font-mono uppercase tracking-widest p-3.5 rounded flex items-center justify-between font-bold">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 select-none animate-bounce" />
                          <span>🟡 BANDEIRA AMARELA NO SETOR: {simYellowFlagMessage}</span>
                        </div>
                        <span className="text-[9px] bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-300">SLOW CAR RECOVERY</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Live standings sheet Left */}
                      <div className="lg:col-span-8 bg-[#0A0A0A] border border-neutral-800 p-4 rounded-md space-y-3">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                          <h3 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                            <Gauge className="h-4 w-4 text-emerald-400 animate-pulse" />
                            <span>Tabela de Corrida - Volta {simRaceLap}/50</span>
                          </h3>
                        </div>

                        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                          {simRaceLeaderboard.map((d, index) => {
                            const isTeamUserDriver = isTeamUser(d.team);
                            const tValues = simTelemetryValues[d.driver];
                            return (
                              <div
                                key={`${d.driver}-${d.team}-${index}`}
                                className={`flex items-center justify-between p-2 rounded border text-xs leading-none transition-all ${
                                  d.isDnf 
                                    ? 'bg-red-950/10 border-red-900/30 opacity-70' 
                                    : 'bg-black/50 border-neutral-900 hover:border-neutral-800'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 truncate w-1/2">
                                  <span className="font-mono font-black text-neutral-400 w-5">P{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                  <span className={`font-mono font-bold truncate ${isTeamUserDriver ? 'text-amber-400' : 'text-white'}`}>
                                    {d.driver.split(' ').pop() || d.driver}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 truncate select-none hidden sm:inline">({d.team})</span>
                                </div>

                                <div className="flex items-center space-x-4 font-mono text-[10px] text-right">
                                  {d.isDnf ? (
                                    <span className="text-[#FF1801] font-bold uppercase tracking-widest text-[9px] px-1.5 py-0.5 bg-red-950/20 border border-red-800/20 rounded">
                                      OUT
                                    </span>
                                  ) : (
                                    <div className="flex items-center space-x-3 text-neutral-300">
                                      {tValues?.drs && (
                                        <span className="px-1 bg-green-500/10 text-green-400 border border-green-500/30 text-[8px] font-bold rounded">
                                          DRS
                                        </span>
                                      )}
                                      <span className="text-zinc-500 text-[9px] font-bold">
                                        G{tValues?.gear || 7}
                                      </span>
                                      <span className="text-white font-bold w-[50px]">
                                        {tValues?.speed || 280} km/h
                                      </span>
                                      <span className="text-zinc-600 hidden sm:inline font-bold w-[35px]">
                                        {tValues?.temp || 112}°C
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right commentators / spotlight */}
                      <div className="lg:col-span-4 space-y-4">
                        
                        {/* Highlights Spotlight Card */}
                        <div className="p-4 bg-zinc-950 border border-neutral-800 rounded-md font-mono space-y-3">
                          <div className="text-[9px] text-zinc-500 tracking-wider uppercase font-bold border-b border-neutral-900 pb-1.5">
                            ⚡ PILOTO DESTAQUE DA SESSÃO
                          </div>
                          
                          {simRaceLeaderboard[0] ? (
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: simRaceLeaderboard[0]?.color }} />
                                <div>
                                  <div className="text-white font-bold">{simRaceLeaderboard[0]?.driver}</div>
                                  <div className="text-[10px] text-zinc-400">{simRaceLeaderboard[0]?.team}</div>
                                </div>
                              </div>

                              <div className="bg-black/50 p-2.5 rounded border border-neutral-900 space-y-1 text-[10px]">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Líder Gaps:</span>
                                  <span className="text-emerald-400 font-bold">INTERVALO P1</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Giros:</span>
                                  <span className="text-white font-bold">{simTelemetryValues[simRaceLeaderboard[0]?.driver]?.rpm || 13500} RPM</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-neutral-600 italic">Preenchendo alinhamento...</p>
                          )}
                        </div>

                        {/* Broadcast terminal box */}
                        <div className="p-4 bg-black border border-neutral-850 rounded-md space-y-2">
                          <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest border-b border-neutral-900 pb-1.5">
                            🎙️ TRANSMISSÃO DA MURETA
                          </div>

                          <div className="space-y-2 max-h-[160px] overflow-y-auto font-mono text-[10px] leading-relaxed text-zinc-400 pr-1 select-none">
                            {simTickerLogs.map((lg, lgIdx) => (
                              <div key={lgIdx} className="border-b border-neutral-950 pb-1.5 last:border-0 hover:text-white transition-colors">
                                {lg}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* PHASE 6: COMPLETED RACE & PODIUM SUMMARY */}
                {simPhase === 'finished_race' && (
                  <div className="space-y-6">
                    
                    {/* Big Podium Box */}
                    <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-lg text-center relative overflow-hidden">
                      <h3 className="text-amber-400 font-mono text-xs uppercase tracking-widest leading-none mb-4 font-bold select-none">
                        CELEBRAÇÃO DO PÓDIO DE TELEMETRIA
                      </h3>

                      <div className="flex justify-center items-end space-x-6 sm:space-x-10 py-6 max-w-md mx-auto">
                        
                        {/* 2nd place stand */}
                        {simRaceLeaderboard[1] && (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-zinc-300 font-mono font-semibold max-w-[80px] truncate leading-tight mb-1 text-center" title={simRaceLeaderboard[1].driver}>
                              {simRaceLeaderboard[1].driver.split(' ').pop()}
                            </span>
                            <span className="text-[8px] text-zinc-500 font-mono mb-2 truncate max-w-[80px]">{simRaceLeaderboard[1].team}</span>
                            <div className="w-16 sm:w-20 bg-neutral-800 border border-neutral-700 h-16 rounded-t shadow-md flex flex-col justify-center items-center">
                              <span className="text-2xl font-mono font-black text-zinc-300">2</span>
                              <span className="text-[9px] text-zinc-400 font-mono leading-none">PRATA</span>
                            </div>
                          </div>
                        )}

                        {/* 1st place stand */}
                        {simRaceLeaderboard[0] && (
                          <div className="flex flex-col items-center scale-105">
                            <Trophy className="h-6 w-6 text-amber-500 fill-current mb-1 animate-pulse" />
                            <span className="text-xs text-amber-400 font-mono font-black max-w-[90px] truncate leading-tight mb-1 text-center" title={simRaceLeaderboard[0].driver}>
                              {simRaceLeaderboard[0].driver.split(' ').pop()}
                            </span>
                            <span className="text-[8px] text-amber-500/80 font-mono mb-2 truncate max-w-[90px]">{simRaceLeaderboard[0].team}</span>
                            <div className="w-20 sm:w-24 bg-amber-500/10 border-2 border-amber-500 h-24 rounded-t shadow-lg flex flex-col justify-center items-center">
                              <span className="text-3xl font-mono font-black text-amber-400">1</span>
                              <span className="text-[10px] text-amber-300 font-mono leading-none">VENCEDOR</span>
                            </div>
                          </div>
                        )}

                        {/* 3rd place stand */}
                        {simRaceLeaderboard[2] && (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-orange-300 font-mono font-semibold max-w-[80px] truncate leading-tight mb-1 text-center" title={simRaceLeaderboard[2].driver}>
                              {simRaceLeaderboard[2].driver.split(' ').pop()}
                            </span>
                            <span className="text-[8px] text-zinc-500 font-mono mb-2 truncate max-w-[80px]">{simRaceLeaderboard[2].team}</span>
                            <div className="w-16 sm:w-20 bg-amber-900/40 border border-amber-900/50 h-12 rounded-t shadow-md flex flex-col justify-center items-center">
                              <span className="text-xl font-mono font-black text-amber-600">3</span>
                              <span className="text-[9px] text-amber-700 font-mono leading-none">BRONZE</span>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Breakdown points list */}
                    <div className="bg-[#050505] border border-neutral-900 p-4 rounded text-xs font-mono">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-widest pb-2 border-b border-neutral-900 mb-2 font-bold select-none">
                        TABELA COMPLETA DE PONTOS DESTE GP
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {simulationResult.raceResults[simGpIdx]?.positions.map((p: any, pIdx: number) => (
                          <div key={`${p.driver}-${p.team}-${pIdx}`} className="p-2 bg-zinc-950/40 border border-neutral-900/60 rounded flex justify-between items-center text-[11px] leading-none">
                            <div className="flex items-center space-x-2 truncate">
                              <span className="font-bold text-zinc-500">P{pIdx + 1}</span>
                              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                              <span className="text-white font-bold truncate mr-1">{p.driver.split(' ').pop()}</span>
                              {p.stress !== undefined && (
                                <span className={`text-[8px] px-1 font-mono rounded font-bold shrink-0 ${
                                  p.stress > 80 ? 'bg-red-950/70 text-[#FF1801] border border-red-900/40' :
                                  p.stress > 50 ? 'bg-amber-950/70 text-amber-500 border border-amber-900/40' :
                                  'bg-neutral-900 text-neutral-400'
                                }`} title={`Nível de estresse acumulado: ${p.stress}%`}>
                                  🧠 {p.stress}%
                                </span>
                              )}
                            </div>
                            <span className={`font-bold ${p.points > 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                              {p.dnf ? 'DNF' : `+${p.points} PTS`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Proceed stage selectors */}
                    <div className="flex gap-4">
                      {simGpIdx < CIRCUITS.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            // Proceed to next race index
                            const nextGpSim = simGpIdx + 1;
                            handleStartGP(nextGpSim);
                          }}
                          className="w-full py-4 bg-green-500 hover:bg-green-600 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white font-display font-bold text-xs uppercase tracking-widest rounded-sm transition-all text-center cursor-pointer active:scale-95 animate-bounce block"
                        >
                          Confirmar Próxima Etapa: GP de {CIRCUITS[simGpIdx + 1]?.name?.replace('Grande Prêmio ', '')} ➡️
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleShowFinalResults}
                          className="w-full py-4 bg-[#FF1801] hover:bg-red-700 hover:shadow-[0_0_25px_rgba(255,24,1,0.4)] text-white font-display font-bold text-xs uppercase tracking-widest rounded-sm transition-all text-center cursor-pointer active:scale-95 animate-bounce block"
                        >
                          🏆 FINALIZAR CAMPEONATO & VER CLASSIFICAÇÃO GERAL 🏆
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* GP CALENDAR SEQUENCER PROGRESS INDICATOR */}
                <div className="border-t border-[#1C1C1C] pt-5 space-y-4 font-mono">
                  <div className="flex justify-between items-center text-[9px] text-[#555] font-bold">
                    <span>PROGRESSO GERAL DO CALENDÁRIO MUNDIAL ({CIRCUITS.length} ETAPAS)</span>
                    <span>GP {simGpIdx + 1} DE 8 ATIVO</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {CIRCUITS.map((rc, idx) => {
                      const isCompeted = idx < simGpIdx;
                      const isNow = idx === simGpIdx;
                      const isUpcoming = idx > simGpIdx;
                      const winnerOfGp = isCompeted && simulationResult?.raceResults[idx]?.podium[0];

                      return (
                        <div
                          key={rc.name}
                          className={`p-2 rounded border text-left flex flex-col justify-between h-20 transition-all ${
                            isNow
                              ? 'border-[#FF1801] bg-[#FF1801]/10 scale-102 shadow-[0_0_10px_rgba(255,24,1,0.15)] text-white'
                              : isCompeted
                              ? 'border-emerald-500/20 bg-emerald-500/5 text-gray-400'
                              : 'border-[#1C1C1C] bg-black/40 text-gray-700'
                          }`}
                        >
                          <div>
                            <span className="text-[7px] font-bold block mb-0.5 text-zinc-500">
                              ETAPA {idx + 1}
                            </span>
                            <span className="block text-[10px] font-sans font-extrabold truncate text-white leading-tight">
                              {rc.name.replace('Grande Prêmio ', 'GP ')}
                            </span>
                          </div>

                          <div>
                            {isNow && (
                              <span className="text-[8px] text-[#FF1801] font-bold flex items-center gap-1 animate-pulse">
                                <span className="h-1.5 w-1.5 bg-[#FF1801] rounded-full"></span>
                                <span>LIVE</span>
                              </span>
                            )}

                            {isCompeted && winnerOfGp && (
                              <div className="text-[9px] text-emerald-400 font-bold truncate flex items-center space-x-1">
                                <Trophy className="h-3 w-3 inline text-amber-500 shrink-0" />
                                <span className="truncate">
                                  {typeof winnerOfGp === 'string'
                                    ? (winnerOfGp.split(' ').pop() || winnerOfGp)
                                    : (winnerOfGp.driver ? (winnerOfGp.driver.split(' ').pop() || winnerOfGp.driver) : 'Nenhum')}
                                </span>
                              </div>
                            )}

                            {isUpcoming && <span className="text-[8px] text-neutral-600 font-bold">AGUARDANDO</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SUPPORT CARDS DOCKS PANEL IN REAL-TIME SIMULATION */}
                <div className="border border-neutral-800 bg-neutral-950/60 p-4 rounded mt-6 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-900 pb-3">
                    <div>
                      <h4 className="text-xs font-display font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider select-none">
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        Paddock Command: Cartas de Suporte
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                        {simGpIdx >= 0 
                          ? `Ative um Card de Buff no GP ativo (${CIRCUITS[simGpIdx]?.name}) para recalcular instantaneamente os tempos e a classificação e impulsionar seu time!`
                          : "Aguarde o início das etapas para injetar telemetria na corrida ativa!"}
                      </p>
                    </div>
                  </div>

                  {availableCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {availableCards.map((card) => {
                        const IconComponent = IconMap[card.icon] || Zap;
                        const isSimActive = simGpIdx >= 0 && simPhase === 'race';
                        return (
                          <div
                            key={card.id}
                            className={`flex flex-col justify-between p-3 rounded border ${card.color} transition-all relative group overflow-hidden ${
                              isSimActive 
                                ? 'hover:scale-[1.01] hover:border-white/30 cursor-pointer shadow-md' 
                                : 'opacity-40 cursor-not-allowed select-none'
                            }`}
                            onClick={() => {
                              if (!isSimActive) {
                                triggerToast('⚠️ Os buffs devem ser injetados exclusivamente durante a corrida ao vivo para recalculas os tempos em tempo real!');
                                return;
                              }
                              setSelectedCardToUse(card);
                              setActiveBuffModals(true);
                              playBeep(440, 0.1);
                            }}
                          >
                            <div className="space-y-1.5 min-h-[60px]">
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-display font-black text-xs uppercase leading-tight tracking-wide">{card.name}</span>
                                <IconComponent className="h-4 w-4 shrink-0 opacity-85" />
                              </div>
                              <p className="text-[10px] text-neutral-300 leading-tight font-sans">{card.description}</p>
                            </div>

                            <button
                              disabled={!isSimActive}
                              className={`w-full mt-2.5 py-1.5 text-[9px] font-mono rounded tracking-widest uppercase font-bold transition-all ${
                                isSimActive 
                                  ? 'bg-white/10 hover:bg-white text-white hover:text-black hover:shadow cursor-pointer' 
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
                    <div className="text-center py-4 text-neutral-500 bg-neutral-900/30 rounded border border-neutral-850">
                      <p className="text-xs font-mono">⚠️ Todas as cartas de suporte foram consumidas neste campeonato!</p>
                    </div>
                  )}

                  {buffHistory.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5 pt-3 border-t border-neutral-900 text-[9px] font-mono text-neutral-400">
                      <span className="uppercase text-neutral-500 font-bold text-[9px] tracking-wider select-none">Histórico de Ativações nesta Temporada:</span>
                      {buffHistory.map((hist, hIdx) => (
                        <div key={hIdx} className="flex gap-2 items-center bg-emerald-950/20 px-2 py-1.5 rounded border border-emerald-950/30 text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{hist}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                                ? 'text-white font-bold' 
                                : ''
                            }`}
                            style={drv.isUser ? {
                              backgroundColor: `${drv.color || '#FF1801'}15`,
                              borderLeft: `2px solid ${drv.color || '#FF1801'}`
                            } : undefined}
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
                                ? 'text-white font-bold' 
                                : ''
                            }`}
                            style={tm.isUser ? {
                              backgroundColor: `${tm.color || '#FF1801'}15`,
                              borderLeft: `2px solid ${tm.color || '#FF1801'}`
                            } : undefined}
                          >
                            <td className="py-3 px-1 font-bold">{idx + 1}</td>
                            <td className="text-white">{tm.team}</td>
                            <td className="text-right font-bold" style={{ color: tm.color || '#FF1801' }}>{tm.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Exibição da Equipe Completa Escolhida */}
                <div className="border-t border-[#222] pt-4 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider">SEU TIME CONTRATADO EM PISTA:</span>
                    {isMultiplayer && (
                      <div className="flex font-mono text-[10px] gap-1.5 items-center bg-black/40 px-2 py-1 rounded border border-neutral-800">
                        <span className="text-neutral-500">Inspecionando:</span>
                        <span className="font-bold flex items-center gap-1" style={{ color: getTeamColor(multiplayerPlayers[activeResultsPlayerIndex]?.teamName) }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: getTeamColor(multiplayerPlayers[activeResultsPlayerIndex]?.teamName) }}></span>
                          {multiplayerPlayers[activeResultsPlayerIndex]?.teamName} ({multiplayerPlayers[activeResultsPlayerIndex]?.name})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isMultiplayer && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {multiplayerPlayers.map((player, pIdx) => {
                        const isInspected = pIdx === activeResultsPlayerIndex;
                        return (
                          <button
                            key={player.id}
                            onClick={() => {
                              setActiveResultsPlayerIndex(pIdx);
                              playBeep(440 + pIdx * 40, 0.05);
                            }}
                            className={`px-3 py-1 text-[10px] uppercase font-mono rounded cursor-pointer transition-all border ${
                              isInspected
                                ? 'bg-neutral-800 border-neutral-700 text-white font-semibold'
                                : 'bg-black/30 border-neutral-900 text-neutral-400 hover:text-neutral-200'
                            }`}
                            style={{
                              borderLeft: `3px solid ${player.color}`
                            }}
                          >
                            {player.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {(() => {
                    const currentInspectSlots = isMultiplayer
                      ? (multiplayerPlayers[activeResultsPlayerIndex]?.slots || {})
                      : slots;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                          <span className="text-[9px] text-gray-500 block font-mono">PILOTO 1:</span>
                          <span className="font-bold text-white truncate block font-display">{currentInspectSlots['driver_1']?.name || 'Vazio'}</span>
                        </div>
                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                          <span className="text-[9px] text-gray-500 block font-mono">PILOTO 2:</span>
                          <span className="font-bold text-white truncate block font-display">{currentInspectSlots['driver_2']?.name || 'Vazio'}</span>
                        </div>
                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                          <span className="text-[9px] text-gray-500 block font-mono">CHASSI:</span>
                          <span className="font-bold text-white truncate block font-display">{currentInspectSlots['chassis']?.name || 'Vazio'}</span>
                        </div>
                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                          <span className="text-[9px] text-gray-500 block font-mono">ENGENHEIRO:</span>
                          <span className="font-bold text-white truncate block font-display">{currentInspectSlots['engineer']?.name || 'Vazio'}</span>
                        </div>
                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                          <span className="text-[9px] text-gray-500 block font-mono">CHEFE:</span>
                          <span className="font-bold text-white truncate block font-display">{currentInspectSlots['team_boss']?.name || 'Vazio'}</span>
                        </div>
                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                          <span className="text-[9px] text-gray-500 block font-mono">ESTRATEGISTA:</span>
                          <span className="font-bold text-white truncate block font-display">{currentInspectSlots['strategist']?.name || 'Vazio'}</span>
                        </div>
                      </div>
                    );
                  })()}
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
                      {simulationResult && simulationResult.teamStandings && (
                        simulationResult.teamStandings.map((teamEntry: any) => {
                          const teamName = teamEntry.team;
                          const isUser = isTeamUser(teamName);
                          const color = teamEntry.color || '#94A3B8';
                          
                          return (
                            <Line
                              key={teamName}
                              type="monotone"
                              dataKey={teamName}
                              stroke={color}
                              strokeWidth={isUser ? 3 : 1.2}
                              strokeOpacity={isUser ? 1.0 : 0.4}
                              strokeDasharray={isUser ? undefined : "3 3"}
                              dot={isUser ? { r: 3.5, stroke: color, strokeWidth: 1.2, fill: '#050505' } : false}
                              activeDot={{ r: isUser ? 6 : 4, stroke: color, strokeWidth: 2, fill: '#ffffff' }}
                              name={teamName}
                            />
                          );
                        })
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
                                      {p.stress !== undefined && (
                                        <span className={`text-[7px] font-bold px-1 ml-1 rounded font-mono ${
                                          p.stress > 80 ? 'bg-red-950/50 text-[#FF1801]' :
                                          p.stress > 50 ? 'bg-amber-950/50 text-amber-500' :
                                          'bg-zinc-900 text-zinc-400'
                                        }`}>
                                          🧠 {p.stress}%
                                        </span>
                                      )}
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
                  Os desfechos das 24 corridas do ano não são fakes. Uma sólida engine lógica roda levando em consideração o Ritmo (Pace) do piloto sorteado, Confiabilidade mecânica do carro de base, força de Engenharia e Estratégia de Box contra o clima instável dos circuitos. Batidas e quebras (DNFs) ocorrem caso monte uma equipe instável ou agressiva demais!
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

      {/* ==================== 5.2 MODAL DE FALÊNCIA TRISTE (FECHAR EQUIPE) ==================== */}
      {bankruptcyModalOpen && bankruptcyDetails && (
        <div id="bankruptcy_modal" className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#0e0a0a] border-2 border-red-900 rounded-xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative animate-zoom-in shadow-[0_0_50px_rgba(255,24,1,0.35)] text-left">
            <div className="absolute top-0 right-0 p-3 text-[8px] text-red-500 font-mono uppercase tracking-widest leading-none">Credores Ativos</div>
            
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-red-950">
              <div className="h-16 w-16 bg-red-950/40 border border-red-700/50 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                <Frown className="h-10 w-10 animate-spin-slow" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-red-950/50 text-red-400 font-mono text-[9px] uppercase border border-red-900/60 font-bold">
                MURAL DA TRISTEZA • DECRETO DE FALÊNCIA IMEDIATA
              </span>
              <h4 className="font-display font-bold text-white text-2xl tracking-tight uppercase">
                {bankruptcyDetails.isMultiplayer ? "💥 Múltiplas Escuderias Falidas!" : `🚨 Adeus, ${bankruptcyDetails.teamName}!`}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
                Após uma simulação de campeonato brutal, seus credores e a junta técnica concluíram que a sobrevivência financeira desta escuderia é inviável, tendo em vista que você não obteve o primeiro lugar sob os holofotes. As portas da fábrica deverão ser soldadas imediatamente.
              </p>
            </div>

            <div className="space-y-4 text-xs text-gray-300 max-h-[40vh] overflow-y-auto pr-1">
              {bankruptcyDetails.isMultiplayer ? (
                <div className="space-y-3">
                  <span className="font-bold text-red-400 block uppercase font-mono tracking-wider">📋 ESCUDERIAS DE JOGADORES QUE FORAM FECHADAS:</span>
                  <div className="space-y-2 bg-black/40 p-3 rounded border border-red-950/50 font-mono text-xs">
                    {bankruptcyDetails.playerList?.map((line, idx) => (
                      <div key={idx} className="flex items-start space-x-2 border-b border-red-950/20 pb-2 last:border-0 last:pb-0 text-red-200">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 italic font-sans mt-2">
                    Apenas a escuderia campeã do campeonato gerou receitas de bilheteria e patrocínio suficientes para se manter ativa no circo da F1! Os perdedores foram despejados do paddock de forma impiedosa.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[#1c0e0e]/45 border border-red-950 p-4 rounded text-xs space-y-2 leading-relaxed">
                    <span className="font-bold text-red-400 uppercase tracking-wider block text-[10px]">📊 BALANÇO FINANCEIRO DE DESPEDIDA:</span>
                    <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-gray-400">
                      <li><strong>Nome do Time:</strong> {bankruptcyDetails.teamName}</li>
                      <li><strong>Colocação Final:</strong> #{bankruptcyDetails.position} no campeonato</li>
                      <li><strong>Pontuação Acumulada:</strong> {bankruptcyDetails.points} pontos de equipe</li>
                      <li><strong>Dívidas com Fornecedores:</strong> $42.500.000 USD (Multas da FIA)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-red-400 block uppercase font-mono tracking-wider">📰 O TRISTE DESTINO DA SUA EQUIPE:</span>
                    <div className="space-y-2 text-gray-400 leading-relaxed pl-1 text-[11px] font-sans">
                      <p>
                        🔹 O piloto titular <strong className="text-white">{bankruptcyDetails.failedStaff?.driver_1?.name || 'seu piloto principal'}</strong> foi visto chorando no motorhome ao assinar sua rescisão forçada de contrato. O coitado deitou ao chão e foi contratado para pilotar karts elétricos promocionais em um shopping paulista.
                      </p>
                      <p>
                        🔹 O chefe de equipe <strong className="text-white">{bankruptcyDetails.failedStaff?.team_boss?.name || 'seu chefe de time'}</strong> tentou trancar fisicamente o reboque de transporte, mas os oficiais de justiça confiscaram inclusive seus computadores e relógios de mureta.
                      </p>
                      <p>
                        🔹 Os bólidos e o chassi lendário <strong className="text-white">{bankruptcyDetails.failedStaff?.chassis?.name || 'seu chassi'}</strong> foram desmontados e leiloados em pacotes de sucata no Mercado Livre por valores irrisórios para sanar os prejuízos de refeição do paddock.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-red-950 pt-4 flex justify-between items-center gap-4">
              <span className="text-[9px] text-gray-500 font-mono italic">"A F1 é um esporte de glórias, mas de falência para os perdedores."</span>
              <button
                id="btn_declare_bankruptcy_close"
                onClick={() => {
                  setBankruptcyModalOpen(false);
                  playBeep(440, 0.1);
                  triggerToast("💸 Ativos liquidados! Veja os detalhes da temporada.");
                }}
                className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-display font-medium text-xs px-6 py-2.5 rounded transition-all cursor-pointer uppercase tracking-widest active:scale-95"
              >
                VENDER DOUTORADO & LIQUIDAR ATIVOS
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== 5.3 PORTAL DE DADOS F1 & MUSEU HISTÓRICO ==================== */}
      {historyEncyclopediaOpen && (
        <div id="paddock_encyclopedia_modal" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6 sm:p-8 max-w-4xl w-full h-[85vh] flex flex-col space-y-5 relative animate-zoom-in text-left">
            <button
              type="button"
              id="btn_close_encyclopedia"
              onClick={() => {
                setHistoryEncyclopediaOpen(false);
                playBeep(330, 0.15);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white font-mono text-xs uppercase p-1.5 transition-all focus:outline-none border border-neutral-800/40 hover:border-neutral-700 rounded cursor-pointer"
            >
              FECHAR ✕
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#FF1801] tracking-widest font-bold uppercase block">
                🏛️ ARQUIVOS OFICIAIS DO PADDOCK
              </span>
              <h3 className="font-display font-medium text-white text-2xl tracking-tight">
                Museu de Construtores &amp; Pilotos Memoráveis
              </h3>
              <p className="text-xs text-gray-400">
                Explore os perfis de equipes lendárias, pilotos históricos (desde campeões renomados até os maiores memes) e engenheiros chefes que moldaram as eras da Fórmula 1.
              </p>
            </div>

            {/* Abas e Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-800 pb-3">
              <div className="flex bg-black/50 p-1 rounded-lg border border-neutral-800 gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  id="tab_teams"
                  onClick={() => {
                    setActiveEncyclopediaTab('teams');
                    setEncyclopediaSearch('');
                    playBeep(580, 0.05);
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-mono rounded font-bold transition-all cursor-pointer ${
                    activeEncyclopediaTab === 'teams'
                      ? 'bg-[#FF1801] text-white shadow-md'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  🏎️ Equipes
                </button>
                <button
                  type="button"
                  id="tab_drivers"
                  onClick={() => {
                    setActiveEncyclopediaTab('drivers');
                    setEncyclopediaSearch('');
                    playBeep(640, 0.05);
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-mono rounded font-bold transition-all cursor-pointer ${
                    activeEncyclopediaTab === 'drivers'
                      ? 'bg-[#FF1801] text-white shadow-md'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  👑 Pilotos
                </button>
                <button
                  type="button"
                  id="tab_engineers"
                  onClick={() => {
                    setActiveEncyclopediaTab('engineers');
                    setEncyclopediaSearch('');
                    playBeep(700, 0.05);
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-mono rounded font-bold transition-all cursor-pointer ${
                    activeEncyclopediaTab === 'engineers'
                      ? 'bg-[#FF1801] text-white shadow-md'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  🔧 Engenheiros
                </button>
              </div>

              {/* Contador rápido */}
              <span className="text-[10px] font-mono text-[#AAA] bg-[#111] px-3 py-1.5 rounded-md border border-neutral-800">
                RESULTADOS:{' '}
                <strong>
                  {activeEncyclopediaTab === 'teams' &&
                    (encyclopediaSearch ? `${filteredTeamsMeta.length} / ${TEAMS_META.length}` : TEAMS_META.length)}
                  {activeEncyclopediaTab === 'drivers' &&
                    (encyclopediaSearch ? `${filteredDriversMeta.length} / ${DRIVERS_META.length}` : DRIVERS_META.length)}
                  {activeEncyclopediaTab === 'engineers' &&
                    (encyclopediaSearch ? `${filteredEngineersMeta.length} / ${ENGINEERS_META.length}` : ENGINEERS_META.length)}
                </strong>
              </span>
            </div>

            {/* Campo de Busca Especial */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 text-xs">
                🔍
              </span>
              <input
                type="text"
                id="encyclopedia_search_input"
                placeholder={
                  activeEncyclopediaTab === 'teams'
                    ? "Buscar equipes por nome, país de origem, tags de reputação..."
                    : activeEncyclopediaTab === 'drivers'
                    ? "Buscar pilotos por nome, país, estilo de pilotagem ou notas..."
                    : "Buscar engenheiros por nome, equipes de passagem e tags..."
                }
                value={encyclopediaSearch}
                onChange={(e) => setEncyclopediaSearch(e.target.value)}
                className="w-full bg-black/60 hover:bg-black/80 border border-neutral-800 text-xs text-white pl-9 pr-16 py-2.5 rounded-lg font-sans placeholder-neutral-500 focus:outline-none focus:border-[#FF1801] transition-all"
              />
              {encyclopediaSearch && (
                <button
                  type="button"
                  id="btn_clear_encyclopedia_search"
                  onClick={() => {
                    setEncyclopediaSearch('');
                    playBeep(400, 0.05);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white text-[10px] uppercase font-mono cursor-pointer focus:outline-none"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {activeEncyclopediaTab === 'teams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTeamsMeta.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-neutral-500 font-mono text-xs">
                      Nenhuma equipe encontrada para a busca "{encyclopediaSearch}".
                    </div>
                  ) : (
                    filteredTeamsMeta.map((team, idx) => {
                      const activeYearsText = team.activeYears
                        ? `${team.activeYears[0]} - ${team.activeYears[1] || 'Presente'}`
                        : 'N/A';
                      return (
                      <div
                        key={team.id || idx}
                        className="bg-black/40 border border-neutral-800/80 hover:border-neutral-700 rounded-xl p-4.5 space-y-3 transition-colors text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-display font-bold text-white text-base tracking-tight">
                              {team.name}
                            </h4>
                            <span className="text-[10px] font-mono text-gray-400">
                              🌍 {team.country} • 📅 {activeYearsText}
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            team.tier === 'legend' ? 'bg-[#FF1801]/15 border border-[#FF1801]/30 text-[#FF1801]' :
                            team.tier === 'strong' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500' :
                            team.tier === 'meme' ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' :
                            'bg-neutral-800 text-neutral-400'
                          }`}>
                            Tier {team.tier}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                          {team.notes}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-neutral-900">
                          {team.reputationTags?.map((tag: string) => (
                            <span key={tag} className="text-[8.5px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-sm uppercase">
                              #{tag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#111]/40 p-2.5 rounded border border-neutral-900/60 leading-tight">
                          <div>
                            <span className="text-neutral-500 block text-[8px] uppercase">Títulos Pilotos:</span>
                            <span className="text-neutral-100 font-bold">{team.titlesDriversApprox || 0}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block text-[8px] uppercase">Títulos Construtores:</span>
                            <span className="text-neutral-100 font-bold">{team.titlesConstructorsApprox || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

              {activeEncyclopediaTab === 'drivers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDriversMeta.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-neutral-500 font-mono text-xs">
                      Nenhum piloto encontrado para a busca "{encyclopediaSearch}".
                    </div>
                  ) : (
                    filteredDriversMeta.map((drv, idx) => {
                      const eraText = `${drv.eraStart} - ${drv.eraEnd || 'Presente'}`;
                      return (
                        <div
                          key={drv.id || idx}
                          className="bg-black/40 border border-neutral-800/80 hover:border-neutral-700 rounded-xl p-4.5 space-y-3 transition-colors text-left"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="font-display font-medium text-white text-base tracking-tight leading-none">
                                  {drv.name}
                                </h4>
                                {drv.hallOfFame && (
                                  <span className="text-[10px]" title="Hall of Fame">⭐</span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-gray-400 block mt-1">
                                {drv.country} • era: {eraText}
                              </span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              drv.tier === 'legend' ? 'bg-[#FF1801]/15 border border-[#FF1801]/30 text-[#FF1801]' :
                              drv.tier === 'strong' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500' :
                              drv.tier === 'meme' ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' :
                              'bg-neutral-800 text-neutral-400'
                            }`}>
                              🏆 {drv.titles > 0 ? `${drv.titles}T` : 'Sem Títulos'}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                            {drv.notes}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-neutral-900">
                            <span className="text-[8.5px] font-mono bg-red-950/20 border border-red-900/30 text-[#FF1801] px-2 py-0.5 rounded-sm uppercase">
                              TIER: {drv.tier}
                            </span>
                            {drv.styleTags?.map((tag: string) => (
                              <span key={tag} className="text-[8.5px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-sm uppercase">
                                #{tag.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeEncyclopediaTab === 'engineers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEngineersMeta.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-neutral-500 font-mono text-xs">
                      Nenhum engenheiro encontrado para a busca "{encyclopediaSearch}".
                    </div>
                  ) : (
                    filteredEngineersMeta.map((eng, idx) => {
                      const eraText = `${eng.eraStart} - ${eng.eraEnd || 'Presente'}`;
                      return (
                        <div
                          key={eng.id || idx}
                          className="bg-black/40 border border-neutral-800/80 hover:border-neutral-700 rounded-xl p-4.5 space-y-3 transition-colors text-left"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-display font-medium text-white text-base tracking-tight">
                                {eng.name}
                              </h4>
                              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                                📅 Era: {eraText}
                              </span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              eng.tier === 'legend' ? 'bg-[#FF1801]/15 border border-[#FF1801]/30 text-[#FF1801]' :
                              eng.tier === 'strong' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500' :
                              'bg-neutral-800 text-neutral-400'
                            }`}>
                              Títulos: {eng.titlesConstructorsApprox || 0}C
                            </span>
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                            {eng.notes}
                          </p>

                          <div className="space-y-1.5 text-[10px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-500 text-[8.5px] uppercase">EQUIPES DE PASSAGEM:</span>
                              <span className="text-neutral-300">{eng.teams?.join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-neutral-900">
                            {eng.reputationTags?.map((tag: string) => (
                              <span key={tag} className="text-[8.5px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-sm uppercase">
                                #{tag.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-800 pt-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                © Banco de Dados Históricos Automobilísticos
              </span>
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

            {isMultiplayer && (
              <div className="space-y-2 border border-neutral-800 p-3 rounded bg-zinc-950 font-sans">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
                  🎯 Escolher Escuderia Destino:
                </label>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {multiplayerPlayers.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setTargetPlayerIdx(idx);
                        playBeep(440, 0.05);
                      }}
                      className={`px-2.5 py-2 text-[10px] font-mono rounded font-bold transition-all border text-left cursor-pointer ${
                        targetPlayerIdx === idx
                          ? 'bg-amber-500 border-amber-500 text-black shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <div className="truncate font-semibold">{p.teamName}</div>
                      <div className="text-[9px] opacity-80 font-sans truncate">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

      {/* ==================== MULTIPLAYER SETUP MODAL ==================== */}
      {multiSetupOpen && (
        <div id="multiplayer_setup_modal" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b0f19] border border-[#20293a] rounded-xl p-5 sm:p-7 max-w-2xl w-full space-y-6 animate-zoom-in my-8 shadow-[0_0_40px_rgba(255,24,1,0.15)]">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Users className="h-6 w-6 text-red-500 animate-pulse" />
                <div>
                  <h4 className="font-display font-bold text-white text-base uppercase tracking-wider">Paddock Multiplayer Local</h4>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Até 4 participantes completando o grid em turnos sequenciais</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMultiSetupOpen(false);
                  playBeep(330, 0.05);
                }}
                className="text-gray-400 hover:text-white font-mono text-sm uppercase px-2 py-1 bg-black/30 rounded border border-neutral-800 cursor-pointer text-xs"
              >
                Voltar
              </button>
            </div>

            {/* Qtd de jogadores */}
            <div className="bg-black/40 p-4 rounded-lg border border-neutral-800/80 space-y-3">
              <label className="text-xs font-mono text-neutral-300 block uppercase font-bold tracking-wide">1. Escolha a Quantidade de Jogadores Simultâneos:</label>
              <div className="flex gap-3">
                {[2, 3, 4].map((num) => {
                  const isActive = multiplayerCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setMultiplayerCount(num);
                        const copy = [...tempPlayerConfigs];
                        // If current size of config is less than selected, fill it
                        while (copy.length < num) {
                          const i = copy.length;
                          copy.push({
                            name: `Jogador ${i + 1}`,
                            teamName: `Equipe ${i + 1} GP`,
                            color: i === 0 ? '#FF1801' : i === 1 ? '#00A398' : i === 2 ? '#FF8700' : '#006F62'
                          });
                        }
                        setTempPlayerConfigs(copy.slice(0, num));
                        playBeep(440 + num * 20, 0.08);
                      }}
                      className={`flex-1 py-3 px-4 rounded font-display font-bold text-xs transition-colors border cursor-pointer ${
                        isActive
                          ? 'bg-[#FF1801] text-white border-[#FF1801] shadow-[0_0_15px_rgba(255,24,1,0.25)]'
                          : 'bg-zinc-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900/50 hover:text-white'
                      }`}
                    >
                      {num} JOGADORES
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configuração de cada um dos Jogadores */}
            <div className="space-y-4 max-h-[46vh] overflow-y-auto pr-1">
              <span className="text-xs font-mono text-neutral-300 block uppercase font-bold tracking-wide">2. Nomeie e Escolha a Escuderia de Cada Integrante:</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tempPlayerConfigs.map((player, idx) => {
                  return (
                    <div 
                      key={idx} 
                      className="p-4 bg-black/60 rounded border border-neutral-800 space-y-3 relative"
                      style={{ borderLeft: `4px solid ${player.color}` }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: player.color }}></span>
                          PILOTO {idx + 1}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500">Configuração de Perfil</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 block mb-0.5 uppercase">Nome do Jogador:</label>
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => {
                              const copy = [...tempPlayerConfigs];
                              copy[idx].name = e.target.value.substring(0, 16);
                              setTempPlayerConfigs(copy);
                            }}
                            className="w-full bg-[#111] border border-neutral-800 focus:border-red-500/50 px-2.5 py-1.5 rounded text-xs text-white focus:outline-none"
                            placeholder={`Jogador ${idx + 1}`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-[#AAA] block mb-0.5 uppercase">Nome da sua equipe (Mudar nome):</label>
                          <input
                            type="text"
                            value={player.teamName}
                            onChange={(e) => {
                              const copy = [...tempPlayerConfigs];
                              copy[idx].teamName = e.target.value.substring(0, 24);
                              setTempPlayerConfigs(copy);
                            }}
                            className="w-full bg-[#111] border border-neutral-800 focus:border-red-500/50 px-2.5 py-1.5 rounded text-xs text-white focus:outline-none font-bold"
                            placeholder="Ex: Senna Racing GP"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">Cor da Escuderia:</label>
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="color"
                              value={player.color}
                              onChange={(e) => {
                                const copy = [...tempPlayerConfigs];
                                copy[idx].color = e.target.value;
                                setTempPlayerConfigs(copy);
                              }}
                              className="w-7 h-7 rounded bg-transparent border-0 cursor-pointer outline-none"
                            />
                            <div className="flex flex-wrap gap-1">
                              {[
                                '#FF1801', // Ferrari Red
                                '#FF8700', // McLaren Orange
                                '#0C1623', // Red Bull Navy
                                '#00A398', // Mercedes Turquoise
                                '#006F62', // Aston Martin Green
                                '#005AFF', // Williams Blue
                                '#EFFF00'  // Lotus Yellow
                              ].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => {
                                    const copy = [...tempPlayerConfigs];
                                    copy[idx].color = c;
                                    setTempPlayerConfigs(copy);
                                    playBeep(480, 0.04);
                                  }}
                                  className={`w-4.5 h-4.5 rounded-full border border-black/40 hover:scale-110 active:scale-95 transition-transform ${
                                    player.color === c ? 'ring-1 ring-white scale-105' : ''
                                  }`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setMultiSetupOpen(false);
                  playBeep(330, 0.1);
                }}
                className="px-5 py-2.5 rounded text-xs font-display font-medium border border-[#222] text-[#AAA] hover:text-white hover:bg-white/5 uppercase transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn_confirm_multiplayer_start"
                type="button"
                onClick={() => {
                  handleStartMultiplayer(multiplayerCount, tempPlayerConfigs);
                  setMultiSetupOpen(false);
                }}
                className="px-8 py-3 rounded text-xs font-display font-bold bg-[#FF1801] hover:bg-red-700 text-white shadow-[0_0_20px_rgba(255,24,1,0.4)] uppercase transition-all tracking-wider cursor-pointer"
              >
                Iniciar Draft 🚦
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
