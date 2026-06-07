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
  const [difficultyMode, setDifficultyMode] = useState<'normal' | 'hard'>('normal');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [slots, setSlots] = useState<Record<string, any>>({});
  const [jokerAvailable, setJokerAvailable] = useState<boolean>(true);
  const [activeCombo, setActiveCombo] = useState<TeamCombination | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [gameMode, setGameMode] = useState<'home' | 'draft' | 'simulating' | 'results' | 'duelo'>('home');
  const [duelPreviousMode, setDuelPreviousMode] = useState<'home' | 'results'>('home');
  const [duelCompetitorA, setDuelCompetitorA] = useState<any>(null);
  const [duelCompetitorB, setDuelCompetitorB] = useState<any>(null);
  const [dnfStressMultiplier, setDnfStressMultiplier] = useState<number>(100);
  const [dnfDuelResult, setDnfDuelResult] = useState<string | null>(null);

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



  // Simulation states
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simActiveRaceIdx, setSimActiveRaceIdx] = useState<number>(-1);
  const [simLightsCount, setSimLightsCount] = useState<number>(0);
  const [simRaceCompleted, setSimRaceCompleted] = useState<boolean>(false);

  // Session History (Session storage based)
  const [recentSessions, setRecentSessions] = useState<SavedSession[]>([]);

  // Sound cue simulation state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

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
  const handleStartGame = (mode: 'normal' | 'hard') => {
    setDifficultyMode(mode);
    setSlots({});
    setActiveSlotIndex(0);
    setJokerAvailable(true);
    setGameMode('draft');
    
    // Draw first combination
    const rolled = getRandomComboExcept([]);
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
    const rolled = getRandomComboExcept(activeCombo ? [activeCombo.teamId] : []);
    setActiveCombo(rolled);
    generateCandidatesForSlot(GAME_SLOTS[activeSlotIndex], rolled, slots);
    
    playBeep(650, 0.15);
    triggerToast('🎲 Coringa ativado! Uma nova escuderia e era histórica foram sorteadas.');
  };

  // Handle manual selection of slot index in sidebar to edit or recruit it
  const handleSelectSlotIndex = (idx: number) => {
    setActiveSlotIndex(idx);
    const rolled = activeCombo || getRandomComboExcept([]);
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
        const rolled = getRandomComboExcept([]);
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

  // Average Rating
  const activeAvgRating = () => {
    const keys = Object.keys(slots);
    if (keys.length === 0) return 0;
    const sum = keys.reduce((acc, k) => acc + (slots[k]?.rating_geral || 80), 0);
    return Math.round(sum / keys.length);
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
                          <span className="font-bold text-white text-sm">#0{index + 1} • {run.champion.split(' ')[0]}</span>
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
              <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1">
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
                  <h4 className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">CALENDÁRIO DE PROVAS (8 ETAPAS):</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CIRCUITS.map((rc, idx) => {
                    const isCompeted = idx < simActiveRaceIdx;
                    const isNow = idx === simActiveRaceIdx;
                    const winnerOfGp = isCompeted && simulationResult?.raceResults[idx]?.podium[0];

                    return (
                      <div
                        key={rc.name}
                        className={`p-3 rounded border text-left flex flex-col justify-between h-24 transition-all ${
                          isNow
                            ? 'border-[#FF1801] bg-[#FF1801]/10 scale-102 shadow-[0_0_12px_rgba(255,24,1,0.25)] text-white'
                            : isCompeted
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-gray-300'
                            : 'border-[#1C1C1C] bg-[#050505]/40 text-gray-600'
                        }`}
                      >
                        <div>
                          <span className="text-[9px] font-mono font-bold block mb-1">
                            ETAPA 0{idx + 1}
                          </span>
                          <span className="block text-xs font-display font-semibold truncate text-white leading-tight">
                            {rc.name}
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
                              <Trophy className="h-3 w-3 inline text-amber-500" />
                              <span className="truncate">{winnerOfGp.driver.split(' ')[1] || winnerOfGp.driver}</span>
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
                    <span>{simActiveRaceIdx + 1} de 8 corridas simuladas</span>
                  </div>
                  <div className="w-full bg-[#151515] h-1.5 rounded overflow-hidden border border-[#222]/50">
                    <div
                      className="bg-[#FF1801] h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,24,1,0.5)]"
                      style={{ width: `${((simActiveRaceIdx + 1) / CIRCUITS.length) * 100}%` }}
                    />
                  </div>
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
                  Seus pilotos e escuderia completaram as 8 etapas históricas do campeonato de F1 enfrentando as maiores lendas de todos os tempos. Veja os resultados de telemetria abaixo!
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
                            key={drv.driver}
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

            {/* DNF Core Tool Module */}
            <div id="dnf_simulation_tool" className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3">
                <AlertTriangle className="h-5 w-5 text-[#FF1801] animate-pulse" />
                <h3 className="font-display font-medium text-white text-sm uppercase tracking-wider">🔧 DNF Telemetry Analyzer & Stress Simulator</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 space-y-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block font-bold">🎡 Multiplicador de Estresse Mecânico:</span>
                  <div className="space-y-1">
                    <input 
                      type="range" 
                      min="20" 
                      max="200" 
                      value={dnfStressMultiplier} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDnfStressMultiplier(val);
                        playBeep(350 + val, 0.03);
                      }}
                      className="w-full accent-red-600 cursor-pointer h-1 bg-[#151515] rounded" 
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>Mínimo (20%)</span>
                      <span className="text-[#FF1801] font-bold">{dnfStressMultiplier}% Stress</span>
                      <span>Máximo (200%)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                    Ajuste o desgaste mecânico e térmico. Valores elevados amplificam as chances de incidentes mecânicos severos (Pane Elétrica, estouro pneumático, DNF) com base na agressividade e confiabilidade de cada piloto.
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

      {/* FOOTER BAR */}
      <footer id="footer" className="bg-[#090d16] border-t border-[#161d2d] py-4 text-center">
        <span className="text-[10px] text-gray-500 font-mono tracking-wider">
          7A0 FORMULA 1 • DESENVOLVIDO EM PORTUGUÊS DE SESSÃO CASUAL
        </span>
      </footer>

    </div>
  );
}
