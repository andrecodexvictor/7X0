/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSlot, Race, SimulationRaceResult, ComboBonus } from './types';
import { CIRCUITS, detectCombos } from './data';

export interface DriverEntry {
  name: string;
  team: string;
  color: string;
  pace: number;
  consistency: number;
  chuva: number;
  aggressiveness: number;
  reliability: number;
  isUser: boolean;
  driverIndex?: 1 | 2;
  playerId?: number;
  slots?: Record<string, any>;
}

// 5 Legendary rival teams to fill out a grid of 12 drivers
export const RIVAL_DRIVERS: DriverEntry[] = [
  // Ferrari 2004
  {
    name: 'Michael Schumacher',
    team: 'Ferrari 2004',
    color: '#EF1A2D',
    pace: 99,
    consistency: 99,
    chuva: 99,
    aggressiveness: 88,
    reliability: 98,
    isUser: false,
  },
  {
    name: 'Rubens Barrichello',
    team: 'Ferrari 2004',
    color: '#EF1A2D',
    pace: 90,
    consistency: 91,
    chuva: 94,
    aggressiveness: 80,
    reliability: 95,
    isUser: false,
  },
  // McLaren 1988
  {
    name: 'Ayrton Senna',
    team: 'McLaren 1988',
    color: '#FF5F00',
    pace: 100,
    consistency: 94,
    chuva: 100,
    aggressiveness: 97,
    reliability: 92,
    isUser: false,
  },
  {
    name: 'Alain Prost',
    team: 'McLaren 1988',
    color: '#FF5F00',
    pace: 96,
    consistency: 100,
    chuva: 88,
    aggressiveness: 80,
    reliability: 98,
    isUser: false,
  },
  // Red Bull 2023
  {
    name: 'Max Verstappen',
    team: 'Red Bull 2023',
    color: '#0600EF',
    pace: 100,
    consistency: 99,
    chuva: 97,
    aggressiveness: 92,
    reliability: 99,
    isUser: false,
  },
  {
    name: 'Sergio Pérez',
    team: 'Red Bull 2023',
    color: '#0600EF',
    pace: 84,
    consistency: 83,
    chuva: 87,
    aggressiveness: 86,
    reliability: 90,
    isUser: false,
  },
  // Mercedes 2021
  {
    name: 'Lewis Hamilton',
    team: 'Mercedes 2021',
    color: '#00A19B',
    pace: 98,
    consistency: 98,
    chuva: 98,
    aggressiveness: 89,
    reliability: 97,
    isUser: false,
  },
  {
    name: 'Valtteri Bottas',
    team: 'Mercedes 2021',
    color: '#00A19B',
    pace: 89,
    consistency: 86,
    chuva: 76,
    aggressiveness: 78,
    reliability: 94,
    isUser: false,
  },
  // Williams 1992
  {
    name: 'Nigel Mansell',
    team: 'Williams 1992',
    color: '#1E40AF',
    pace: 96,
    consistency: 91,
    chuva: 91,
    aggressiveness: 96,
    reliability: 88,
    isUser: false,
  },
  {
    name: 'Riccardo Patrese',
    team: 'Williams 1992',
    color: '#1E40AF',
    pace: 86,
    consistency: 89,
    chuva: 84,
    aggressiveness: 81,
    reliability: 90,
    isUser: false,
  },
  // Renault 2005
  {
    name: 'Fernando Alonso',
    team: 'Renault 2005',
    color: '#00A0E2',
    pace: 96,
    consistency: 97,
    chuva: 95,
    aggressiveness: 91,
    reliability: 95,
    isUser: false,
  },
  {
    name: 'Giancarlo Fisichella',
    team: 'Renault 2005',
    color: '#00A0E2',
    pace: 85,
    consistency: 86,
    chuva: 85,
    aggressiveness: 80,
    reliability: 90,
    isUser: false,
  },
  // Red Bull 2013
  {
    name: 'Sebastian Vettel',
    team: 'Red Bull 2013',
    color: '#1d2a4a',
    pace: 97,
    consistency: 96,
    chuva: 94,
    aggressiveness: 89,
    reliability: 96,
    isUser: false,
  },
  {
    name: 'Mark Webber',
    team: 'Red Bull 2013',
    color: '#1d2a4a',
    pace: 88,
    consistency: 90,
    chuva: 86,
    aggressiveness: 85,
    reliability: 92,
    isUser: false,
  }
];

export function runChampionshipSimulation(
  slots: Record<string, any>,
  difficultyMode: 'normal' | 'hard' | 'underdog',
  playerTeamName: string = 'Seu Time',
  playerTeamColor: string = '#FF3E3E',
  multiplayerPlayers?: { id: number; name: string; teamName: string; color: string; slots: Record<string, any> }[]
): {
  raceResults: SimulationRaceResult[];
  driverStandings: { driver: string; team: string; points: number; isUser: boolean; color: string; wins: number; podiums: number; dnfCount: number; playerId?: number }[];
  teamStandings: { team: string; points: number; isUser: boolean; color: string; playerId?: number }[];
  narrationHighlights: string[];
} {
  // Determine list of active players in simulation
  const finalPlayers = multiplayerPlayers && multiplayerPlayers.length > 0 
    ? multiplayerPlayers 
    : [{ id: 1, name: 'Jogador 1', teamName: playerTeamName, color: playerTeamColor, slots }];

  const userDrivers: DriverEntry[] = [];
  let championStoryTriggered = false;
  const narrationHighlights: string[] = [];

  // Teammate and Stress tracking maps
  const teammateOf: Record<string, string> = {};
  const driverStress: Record<string, number> = {};

  // Standings tracker
  const standingsPoints: Record<string, number> = {};
  const standingsWins: Record<string, number> = {};
  const standingsPodiums: Record<string, number> = {};
  const standsDnfCount: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};

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

  // 1. Check which drivers have been hired by the player(s)
  const hiredNames = new Set<string>();
  finalPlayers.forEach(player => {
    const pSlots = player.slots;
    if (pSlots) {
      const d1 = pSlots['driver_1'];
      const d2 = pSlots['driver_2'];
      if (d1 && d1.name) hiredNames.add(normalizeDriverNameForGrid(d1.name));
      if (d2 && d2.name) hiredNames.add(normalizeDriverNameForGrid(d2.name));
    }
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

  // Pre-seed rival teammate links
  for (let i = 0; i < cleanRivalDrivers.length; i += 2) {
    const drv1 = cleanRivalDrivers[i];
    const drv2 = cleanRivalDrivers[i+1];
    if (drv1 && drv2) {
      teammateOf[`${drv1.name} (${drv1.team})`] = `${drv2.name} (${drv2.team})`;
      teammateOf[`${drv2.name} (${drv2.team})`] = `${drv1.name} (${drv1.team})`;
    }
  }

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

    // Map teammate relationship
    const d1Name = d1?.name || `${player.name} Piloto 1`;
    const d2Name = d2?.name || `${player.name} Piloto 2`;
    const d1Key = `${d1Name} (${player.teamName})`;
    const d2Key = `${d2Name} (${player.teamName})`;
    teammateOf[d1Key] = d2Key;
    teammateOf[d2Key] = d1Key;

    // Detect elite psychological sibling conflicts (Racha no Elenco)
    const isSennaProst = (d1Name.includes('Senna') && d2Name.includes('Prost')) || (d1Name.includes('Prost') && d2Name.includes('Senna'));
    const isHamiltonAlonso = (d1Name.includes('Hamilton') && d2Name.includes('Alonso')) || (d1Name.includes('Alonso') && d2Name.includes('Hamilton'));
    const isVettelWebber = (d1Name.includes('Vettel') && d2Name.includes('Webber')) || (d1Name.includes('Webber') && d2Name.includes('Vettel'));
    const bothAggressive = d1 && d2 && d1.aggressiveness >= 90 && d2.aggressiveness >= 90;

    let rivalryPaceBonus = 0;
    let rivalryReliabilityDebuff = 0;

    if (isSennaProst) {
      rivalryPaceBonus = 10; // Extreme speed due to obsession
      rivalryReliabilityDebuff = -18; // Frequent mutual crash hazard
      driverStress[d1Key] = 55;
      driverStress[d2Key] = 55;
      narrationHighlights.push(`🚨 CRÍTICO: Senna e Prost no mesmo box! Ativou [RACHA NO ELENCO] - Ganham +10 de Ritmo Absoluto, mas a Confiabilidade despencou e o estresse inicial é crítico (55%).`);
    } else if (isHamiltonAlonso) {
      rivalryPaceBonus = 7;
      rivalryReliabilityDebuff = -12;
      driverStress[d1Key] = 45;
      driverStress[d2Key] = 45;
      narrationHighlights.push(`🚨 CONFLITO: Alonso e Hamilton reatam a guerra fria de 2007! Ativou [RIVALIDADE DE EGOS] - +7 de Pace, porém Confiabilidade cedeu e o stress inicial subiu para 45%.`);
    } else if (isVettelWebber) {
      rivalryPaceBonus = 5;
      rivalryReliabilityDebuff = -8;
      driverStress[d1Key] = 35;
      driverStress[d2Key] = 35;
      narrationHighlights.push(`⚠️ DISPUTA: Vettel e Webber reacendem o racha interno Multi-21. Rivalidade silenciosa: +5 Pace, -8 Confiabilidade.`);
    } else if (bothAggressive) {
      rivalryPaceBonus = 3;
      rivalryReliabilityDebuff = -6;
      driverStress[d1Key] = 25;
      driverStress[d2Key] = 25;
      narrationHighlights.push(`⚠️ ALTA TENSÃO: Dois pilotos extremamente agressivos no cockpit. Clima polvilhado nas reuniões: +3 Pace, -6 Confiabilidade.`);
    }

    // Check which combos are active
    const combos = detectCombos(pSlots);
    const totalComboBonus = combos.reduce((acc, c) => acc + c.bonusValue, 0);

    // Compute player team baseline parameters
    const bossRating = boss?.rating_geral || 85;
    const chassisRating = chassis?.rating_geral || 85;
    const strategistRating = strategist?.rating_geral || 85;
    const engineerRating = engineer?.rating_geral || 85;

    const enginePower = (engine?.powerBias || 8.5) * 10;
    const engineReliability = (engine?.reliabilityBias || 8.5) * 10;
    const engineDriveability = (engine?.driveabilityBias || 8.5) * 10;

    // Backup support bonus
    const supportBonus = (reserve1?.rating_geral || 80) / 20;

    // Strategy efficiency
    const stratFactor = (strategistRating + bossRating) / 2; // base 50-100
    // Reliability score (impacted heavily by active crew/driver rivalries)
    const reliabilityScore = ((chassis?.reliability || 85) + engineerRating + (boss?.pressure_handling || 85) + engineReliability) / 4 + totalComboBonus / 2 + rivalryReliabilityDebuff;

    // Build User Driver 1 Entry
    const userDriver1: DriverEntry = {
      name: d1Name,
      team: player.teamName,
      color: player.color,
      pace: (d1?.pace || 85) + (chassisRating * 0.15) + (engineerRating * 0.1) + (enginePower * 0.12) + totalComboBonus / 3 + supportBonus + rivalryPaceBonus,
      consistency: (d1?.consistency || 85) + (bossRating * 0.08) + (engineDriveability * 0.06) + totalComboBonus / 4,
      chuva: (d1?.chuva || 85) + (engineDriveability * 0.05) + totalComboBonus / 4,
      aggressiveness: d1?.aggressiveness || 85,
      reliability: reliabilityScore,
      isUser: true,
      driverIndex: 1,
      playerId: player.id,
      slots: pSlots,
    };

    // Build User Driver 2 Entry
    const userDriver2: DriverEntry = {
      name: d2Name,
      team: player.teamName,
      color: player.color,
      pace: (d2?.pace || 83) + (chassisRating * 0.15) + (engineerRating * 0.1) + (enginePower * 0.12) + totalComboBonus / 3 + supportBonus + rivalryPaceBonus,
      consistency: (d2?.consistency || 82) + (bossRating * 0.08) + (engineDriveability * 0.06) + totalComboBonus / 4,
      chuva: (d2?.chuva || 83) + (engineDriveability * 0.05) + totalComboBonus / 4,
      aggressiveness: d2?.aggressiveness || 85,
      reliability: reliabilityScore,
      isUser: true,
      driverIndex: 2,
      playerId: player.id,
      slots: pSlots,
    };

    userDrivers.push(userDriver1, userDriver2);
  });

  // Compile active grid of drivers
  const gridDrivers: DriverEntry[] = [...cleanRivalDrivers, ...userDrivers];

  gridDrivers.forEach(d => {
    const dKey = `${d.name} (${d.team})`;
    standingsPoints[dKey] = 0;
    standingsWins[dKey] = 0;
    standingsPodiums[dKey] = 0;
    standsDnfCount[dKey] = 0;
    teamPoints[d.team] = 0;
    
    // Initialize stress for drivers if not set by rivalry pre-seeding
    if (driverStress[dKey] === undefined) {
      if (d.name === 'Ayrton Senna' || d.name === 'Alain Prost') {
        driverStress[dKey] = 50; // High default CPU rivalry intensity
      } else if (d.name === 'Sebastian Vettel' || d.name === 'Mark Webber') {
        driverStress[dKey] = 35;
      } else {
        driverStress[dKey] = 10; // normal calm flow
      }
    }
  });

  const raceResults: SimulationRaceResult[] = [];

  // F1 Points System: 1st through 10th
  const f1Points = [10, 8, 6, 5, 4, 3, 2, 1, 0, 0];

  // 3. Loop over courses
  CIRCUITS.forEach((race, raceIdx) => {
    const driverRaceScores: { driver: DriverEntry; score: number; dnf: boolean; dnfReason?: string; trackEffect?: string }[] = [];

    gridDrivers.forEach(drv => {
      const dKey = `${drv.name} (${drv.team})`;
      // Fetch dynamic driver stress level (Ranges from 5% to 100%)
      const currentStress = driverStress[dKey] || 10;

      // STRESS IMPACT FORMULAS:
      // High stress reduces consistency (loss of focus) and pace (nervous driving)
      const stressConsistencyPenalty = Math.max(0, (currentStress - 15) * 0.25);
      const stressPacePenalty = currentStress > 80 ? 4.5 : (currentStress > 60 ? 2.0 : 0);
      
      // Flow state: very calm drivers get a stability boost!
      const flowStateBonus = currentStress < 15 ? 2.5 : 0;

      const adjustedPace = drv.pace - stressPacePenalty + flowStateBonus;
      const adjustedConsistency = Math.max(30, drv.consistency - stressConsistencyPenalty + (currentStress < 15 ? 3.0 : 0));

      // Base performance formula using adjusted values
      let baseGridScore = 0;

      // Track style multiplier
      if (race.type === 'veloz') {
        const topSpeedFactor = drv.isUser ? (drv.slots?.['chassis']?.top_speed || 85) : 95;
        baseGridScore += adjustedPace * 0.5 + topSpeedFactor * 0.5;
      } else if (race.type === 'rua' || race.type === 'técnico') {
        const pSlots = drv.slots;
        const chassisAero = pSlots?.['chassis']?.aerodynamics || 85;
        const pBossRating = pSlots?.['team_boss']?.rating_geral || 85;
        const pStrategistRating = pSlots?.['strategist']?.rating_geral || 85;
        const pStratFactor = (pStrategistRating + pBossRating) / 2;
        const aeroFactor = drv.isUser ? (chassisAero * 0.4 + pStratFactor * 0.3) : 94;
        baseGridScore += adjustedPace * 0.5 + adjustedConsistency * 0.3 + aeroFactor * 0.2;
      } else {
        baseGridScore += adjustedPace * 0.6 + adjustedConsistency * 0.4;
      }

      // Wet weather check
      if (race.isWet) {
        const wetAdvantage = drv.chuva;
        baseGridScore = (wetAdvantage * 0.8) + (adjustedPace * 0.2) + 12;

        if (drv.isUser) {
          if (raceIdx === 0 && !championStoryTriggered) {
            narrationHighlights.push(`GP do Brasil sob temporal! O piloto da ${drv.team} tenta dominar as curvas de Interlagos.`);
          }
        }
      }

      // Calculate track style driver-specific bonuses and debuffs
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
        if (adjustedPace >= 97) {
          trackModifier += 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | ⚡ Ritmo de Reta (+4)` : '⚡ Ritmo de Reta (+4)';
        } else if (adjustedPace < 85) {
          trackModifier -= 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 🐢 Baixa Potência (-4)` : '🐢 Baixa Potência (-4)';
        }
      } else if (race.type === 'rua') {
        if (adjustedConsistency >= 94) {
          trackModifier += 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 🛡️ Precisão Urbana (+4)` : '🛡️ Precisão Urbana (+4)';
        } else if (adjustedConsistency < 84) {
          trackModifier -= 4;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 💥 Risco de Muro (-4)` : '💥 Risco de Muro (-4)';
        }
      } else if (race.type === 'técnico') {
        if (adjustedConsistency >= 95) {
          trackModifier += 3;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 📐 Curvatura Técnica (+3)` : '📐 Curvatura Técnica (+3)';
        }
        if (drv.aggressiveness >= 95) {
          trackModifier -= 3;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | ⛔ Desgaste de Pneus (-3)` : '⛔ Desgaste de Pneus (-3)';
        }
      } else if (race.type === 'clássico') {
        if (adjustedConsistency >= 92 && drv.reliability >= 92) {
          trackModifier += 3;
          trackEffectDesc = trackEffectDesc ? `${trackEffectDesc} | 🏆 Fluxo Histórico (+3)` : '🏆 Fluxo Histórico (+3)';
        }
      }

      // Apply modifiers to base grid score
      let adjustedGridScore = baseGridScore + trackModifier;

      // Apply controlled randomness (between -8 and +8)
      const rngFactor = (Math.random() - 0.5) * 16;
      let finalScore = adjustedGridScore + rngFactor;

      // Calculate DNF likelihood with expanded variables to generate player tension
      const dnfRoll = Math.random() * 100;
      let isDnf = false;
      let dnfReason = '';

      const effectiveReliability = drv.reliability;

      // COMPUTE ADVANCED DNF FACTORS
      const baseReliabilityChance = (100 - effectiveReliability) * 0.15;
      const baseAggressivenessChance = drv.aggressiveness * 0.04;
      
      // 1. Component Fatigue over season rounds
      const roundFatiguePenalty = raceIdx * 0.8;

      // 2. Low-Rating Driver Chaos (Frustration-generating bad drivers)
      // If driver ratings or stats are low, they are far more error-prone!
      const minPaceOrConsistency = Math.min(adjustedPace, adjustedConsistency);
      const isLowRating = minPaceOrConsistency < 60;
      const lowRatingPenalty = isLowRating ? (15 + (60 - minPaceOrConsistency) * 0.6) : 0;

      // 3. Wet track & High Aggressiveness penalty
      const wetTrackAggressivenessPenalty = (race.isWet && drv.aggressiveness >= 90) ? 8.0 : 0;

      // 4. Random race-specific weather/incident risk risk spike (e.g. Monza, Monaco, Spa)
      const raceIncidentRisk = ((raceIdx * 7) % 10) < 3 ? 5.5 : 0;

      // 5. Driver Stress penalty: High stress drastically spikes cockpit errors!
      const stressDnfPenalty = Math.max(0, (currentStress - 20) * 0.18);

      // 6. Difficulty mode multiplier for player drivers to generate challenge
      const userMultiplier = drv.isUser ? (difficultyMode === 'hard' ? 1.6 : (difficultyMode === 'underdog' ? 1.3 : 1.0)) : 1.0;

      const totalDnfChance = (baseReliabilityChance + baseAggressivenessChance + roundFatiguePenalty + lowRatingPenalty + wetTrackAggressivenessPenalty + raceIncidentRisk + stressDnfPenalty) * userMultiplier;

      if (dnfRoll < totalDnfChance) {
        isDnf = true;
        standsDnfCount[dKey] += 1;
        
        // Expanded pool of highly frustrating and humorous reasons:
        const reasons = [
          'Pane Elétrica Geral',
          'Estouro Súbito de Pneu na Reta Oposta',
          'Vazamento Crítico de Óleo',
          'Colisão catastrófica na largada',
          'Superaquecimento Crítico do Motor',
          'Rodada de amador e atolamento na caixa de brita',
          'Erro bizarro no pitstop (roda traseira mal encaixada)',
          'Toque estúpido do rival provocando furo de pneu',
          'Quebra súbita da suspensão dianteira',
          'Pane Seca de combustível na última volta liderando!',
          'Piloto perdeu o foco alterando o rádio e bateu sozinho',
          'Fumaça azul misteriosa saindo dos escapes',
          'Quebra insolvente do câmbio de marchas',
          'Desqualificação por desgaste ilegal da prancha do assoalho'
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

    // Sort this race results from highest score to lowest, moving DNFs to the end
    driverRaceScores.sort((a, b) => {
      if (a.dnf && !b.dnf) return 1;
      if (!a.dnf && b.dnf) return -1;
      return b.score - a.score;
    });

    // Prepare Podium list & detailed positions
    const podium: { driver: string; team: string; color: string }[] = [];
    const positions: { driver: string; team: string; points: number; color: string; dnf: boolean; incident?: string; trackEffect?: string; stress?: number }[] = [];

    driverRaceScores.forEach((item, posIdx) => {
      const isDnf = item.dnf;
      // Assign points: since DNFs are at the end, posIdx < 10 represents the top 10 finishers
      const pointsEarned = (!isDnf && posIdx < 10) ? f1Points[posIdx] : 0;

      const dKey = `${item.driver.name} (${item.driver.team})`;

      standingsPoints[dKey] += pointsEarned;
      teamPoints[item.driver.team] += pointsEarned;

      if (!isDnf && posIdx === 0) {
        standingsWins[dKey] += 1;
      }
      if (!isDnf && posIdx < 3) {
        standingsPodiums[dKey] += 1;
      }

      // Add to race results arrays
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
        trackEffect: item.trackEffect,
        stress: Math.round(driverStress[dKey] || 10)
      });
    });

    // --- GAMEPLAY STRESS PROGRESSIVE UPDATER ---
    // Build swift record tables for this race
    const racePositionsMap: Record<string, number> = {};
    const raceDnfMap: Record<string, boolean> = {};
    driverRaceScores.forEach((item, idx) => {
      const dKey = `${item.driver.name} (${item.driver.team})`;
      racePositionsMap[dKey] = idx;
      raceDnfMap[dKey] = item.dnf;
    });

    gridDrivers.forEach(drv => {
      let stressChange = 0;
      const dKey = `${drv.name} (${drv.team})`;
      const isDnf = raceDnfMap[dKey];
      const position = racePositionsMap[dKey];

      if (isDnf) {
        stressChange += 22; // High pressure after on-track failure
      } else {
        if (position === 0) {
          stressChange -= 22; // Victory brings supreme calm
        } else if (position < 3) {
          stressChange -= 14; // Podium cools cockpit stress
        } else if (position < 10) {
          stressChange -= 7; // Points secure confidence
        } else {
          stressChange += 10; // Finishing P11+ frustrates and stresses
        }
      }

      // Track elements
      if (race.isWet) stressChange += 5;
      if (race.type === 'rua') stressChange += 4;

      // Head-to-Head teammate psych war
      const tmKey = teammateOf[dKey];
      if (tmKey) {
        const tmPos = racePositionsMap[tmKey];
        const tmDnf = raceDnfMap[tmKey];

        if (!isDnf && !tmDnf) {
          if (position > tmPos) {
            stressChange += 9; // Losing to your teammate increases pressure & rivalry stress
          } else {
            stressChange -= 5; // Beating teammate lowers stress
          }
        }
        if (tmDnf && !isDnf) {
          stressChange += 4; // Extra focus stress as sole point earner
        }
      }

      // Continuous team friction (Racha no elenco drift)
      if (drv.isUser && drv.slots) {
        const pSlots = drv.slots;
        const d1 = pSlots['driver_1'];
        const d2 = pSlots['driver_2'];
        if (d1 && d2) {
          const d1Name = d1.name;
          const d2Name = d2.name;
          const isSennaProst = (d1Name.includes('Senna') && d2Name.includes('Prost')) || (d1Name.includes('Prost') && d2Name.includes('Senna'));
          const isHamiltonAlonso = (d1Name.includes('Hamilton') && d2Name.includes('Alonso')) || (d1Name.includes('Alonso') && d2Name.includes('Hamilton'));
          const isVettelWebber = (d1Name.includes('Vettel') && d2Name.includes('Webber')) || (d1Name.includes('Webber') && d2Name.includes('Vettel'));
          const bothAggressive = d1.aggressiveness >= 90 && d2.aggressiveness >= 90;

          if (isSennaProst) stressChange += 11;
          else if (isHamiltonAlonso) stressChange += 8;
          else if (isVettelWebber) stressChange += 6;
          else if (bothAggressive) stressChange += 4;
        }
      } else {
        if (drv.name === 'Ayrton Senna' || drv.name === 'Alain Prost') {
          stressChange += 11;
        } else if (drv.name === 'Sebastian Vettel' || drv.name === 'Mark Webber') {
          stressChange += 6;
        }
      }

      // Mitigating manager effect
      if (drv.isUser && drv.slots) {
        const boss = drv.slots['team_boss'];
        if (boss) {
          const bossRating = boss.rating_geral || 85;
          const coolDown = Math.floor((bossRating - 50) * 0.08); // high stats boss pacifies the arena
          stressChange -= coolDown;
        }
      }

      const prevStress = driverStress[dKey] || 10;
      let newStress = prevStress + stressChange;
      newStress = Math.max(5, Math.min(100, newStress));
      driverStress[dKey] = newStress;

      // In-paddock friction narration alert
      if (drv.isUser && newStress > 85 && prevStress <= 85) {
        narrationHighlights.push(`🔥 ALARM DE BOX: O estresse de ${drv.name} da equipe ${drv.team} explodiu para ${Math.round(newStress)}%! A rivalidade acirrada no elenco ameaça dividir o box e sabotar os resultados do time.`);
      }
    });

    // Store GP result
    raceResults.push({
      raceName: race.name,
      podium,
      positions,
    });

    // Add race highlight narration occasionally
    const winner = positions[0];
    const userBestIndex = positions.findIndex(p => gridDrivers.find(d => d.name === p.driver && d.isUser));
    
    if (race.name === 'Grande Prêmio da Bélgica') {
      if (userBestIndex === 0) {
        narrationHighlights.push(`Vitória mágica em Spa-Francorchamps! ${positions[userBestIndex].driver} escalou o grid de forma lendária vencendo sob gritos de emoção pela equipe ${positions[userBestIndex].team}.`);
      } else if (userBestIndex >= 0 && userBestIndex < 3) {
        narrationHighlights.push(`Pódio disputado na Bélgica! A equipe ${positions[userBestIndex].team} demonstrou ótima estabilidade nas curvas rápidas de Spa para cruzar em P${userBestIndex + 1}.`);
      } else if (userBestIndex >= 0) {
        const dnfDetect = positions.find(p => gridDrivers.find(d => d.name === p.driver && d.isUser && d.team === p.team) && p.dnf);
        if (dnfDetect) {
          narrationHighlights.push(`Frustração em Spa: ${dnfDetect.driver} abandonou por conta de ${dnfDetect.incident}.`);
        } else {
          narrationHighlights.push(`Ritmo conservador em Spa-Francorchamps. ${positions[userBestIndex].driver} (${positions[userBestIndex].team}) garantiu pontos importantes fechando em P${userBestIndex + 1}.`);
        }
      }
    }

    if (race.name === 'Grande Prêmio da Grã-Bretanha') {
      const hasDnf = positions.some(p => gridDrivers.find(d => d.name === p.driver && d.isUser) && p.dnf);
      if (hasDnf) {
        narrationHighlights.push(`Drama na Grã-Bretanha: Contatos acalorados na curva Copse causaram avaria mecânica grave em cockpit do grid.`);
      } else if (userBestIndex >= 0) {
        const pSlots = gridDrivers.find(d => d.team === positions[userBestIndex].team && d.isUser)?.slots;
        const engineerName = pSlots?.['engineer']?.name || 'sua equipe';
        narrationHighlights.push(`Aero de alto impacto em Silverstone! O Engenheiro Chefe (${engineerName}) otimizou o arrasto de ${positions[userBestIndex].team}, reduzindo o tempo de volta.`);
      }
    }

    if (raceIdx === CIRCUITS.length - 1) { // Final showdown
      narrationHighlights.push(`Grande Finale na pista de Abu Dhabi! Disputas roda a roda decidem o título mundial da temporada.`);
    }
  });

  // 4. Format final Standings
  const finalDriverStandings = gridDrivers.map(drv => {
    const dKey = `${drv.name} (${drv.team})`;
    return {
      driver: drv.name,
      team: drv.team,
      points: standingsPoints[dKey],
      isUser: drv.isUser,
      color: drv.color,
      wins: standingsWins[dKey],
      podiums: standingsPodiums[dKey],
      dnfCount: standsDnfCount[dKey],
      playerId: drv.playerId
    };
  }).sort((a, b) => b.points - a.points);

  const finalTeamStandings = Object.keys(teamPoints).map(tName => {
    const drvOfTeam = gridDrivers.find(d => d.team === tName);
    const isU = drvOfTeam?.isUser || false;
    return {
      team: tName,
      points: teamPoints[tName],
      isUser: isU,
      color: drvOfTeam?.color || '#94A3B8',
      playerId: drvOfTeam?.playerId
    };
  }).sort((a, b) => b.points - a.points);

  // Generate Championship narration wrap up
  const leadDriver = finalDriverStandings[0];
  const userLeadDriver = finalDriverStandings.find(d => d.isUser);
  const bestTeam = finalTeamStandings[0];

  if (leadDriver.isUser) {
    narrationHighlights.unshift(`🏆 HISTÓRICO! ${leadDriver.driver} é coroado CAMPEÃO MUNDIAL de Fórmula 1 com uma campanha brilhante de ${leadDriver.wins} vitórias pela escuderia ${leadDriver.team}!`);
  } else {
    narrationHighlights.unshift(`🏆 ${leadDriver.driver} (${leadDriver.team}) faturou o caneco de campeão de pilotos com ${leadDriver.points} pontos. O competidor ${userLeadDriver?.driver || 'dos pilotos desafiantes'} (${userLeadDriver?.team || ''}) fechou em P${finalDriverStandings.findIndex(d => d.isUser) + 1}.`);
  }

  if (bestTeam.isUser) {
    narrationHighlights.unshift(`🔥 TÍTULO DOS CONSTRUTORES! A escuderia ${bestTeam.team} superou as maiores lendas da história com ${bestTeam.points} pontos no topo do mundo do Paddock!`);
  } else {
    const firstUserTeam = finalTeamStandings.find(t => t.isUser);
    if (firstUserTeam) {
      const userTeamPos = finalTeamStandings.findIndex(t => t.team === firstUserTeam.team);
      narrationHighlights.push(`No Campeonato de Construtores, a escuderia ${firstUserTeam.team} fechou em ${userTeamPos + 1}º lugar, marcando ${firstUserTeam.points} pontos.`);
    }
  }

  return {
    raceResults,
    driverStandings: finalDriverStandings,
    teamStandings: finalTeamStandings,
    narrationHighlights,
  };
}
