/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSlot, Race, SimulationRaceResult, ComboBonus } from './types';
import { CIRCUITS, detectCombos } from './data';

interface DriverEntry {
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
}

// 5 Legendary rival teams to fill out a grid of 12 drivers
const RIVAL_DRIVERS: DriverEntry[] = [
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
  }
];

export function runChampionshipSimulation(
  slots: Record<string, any>,
  difficultyMode: 'normal' | 'hard'
): {
  raceResults: SimulationRaceResult[];
  driverStandings: { driver: string; team: string; points: number; isUser: boolean; color: string; wins: number; podiums: number; dnfCount: number }[];
  teamStandings: { team: string; points: number; isUser: boolean; color: string }[];
  narrationHighlights: string[];
} {
  // 1. Gather choices
  const d1 = slots['driver_1'];
  const d2 = slots['driver_2'];
  const reserve1 = slots['reserve_1'];
  const reserve2 = slots['reserve_2'];
  const wetSpecialist = slots['wet_specialist'];
  const legacyWildcard = slots['legacy_wildcard'];
  const boss = slots['team_boss'];
  const chassis = slots['chassis'];
  const strategist = slots['strategist'];
  const engineer = slots['engineer'];

  // Check which combos are active
  const combos = detectCombos(slots);
  const totalComboBonus = combos.reduce((acc, c) => acc + c.bonusValue, 0);

  // 2. Compute user team baseline parameters
  const bossRating = boss?.rating_geral || 85;
  const chassisRating = chassis?.rating_geral || 85;
  const strategistRating = strategist?.rating_geral || 85;
  const engineerRating = engineer?.rating_geral || 85;

  // Backup support bonus
  const supportBonus = ((reserve1?.rating_geral || 80) + (reserve2?.rating_geral || 80)) / 40; // max ~4.5 points bonus
  const legacyBonus = (legacyWildcard?.rating_geral || 80) / 30; // max ~3.3 points

  // Strategy efficiency
  const stratFactor = (strategistRating + bossRating) / 2; // base 50-100
  // Reliability score
  const reliabilityScore = ((chassis?.reliability || 85) + (engineerRating) + (boss?.pressure_handling || 85)) / 3 + totalComboBonus / 2;

  // Build User Driver 1 Entry
  const userDriver1: DriverEntry = {
    name: d1?.name || 'Seu Piloto 1',
    team: 'Seu Time',
    color: '#FF3E3E', // High impact racing red
    pace: (d1?.pace || 85) + (chassisRating * 0.15) + (engineerRating * 0.1) + totalComboBonus / 3 + supportBonus + legacyBonus,
    consistency: (d1?.consistency || 85) + (bossRating * 0.08) + totalComboBonus / 4,
    chuva: (d1?.chuva || 85) + ((wetSpecialist?.chuva || 85) * 0.05) + totalComboBonus / 4,
    aggressiveness: d1?.aggressiveness || 85,
    reliability: reliabilityScore,
    isUser: true,
    driverIndex: 1,
  };

  // Build User Driver 2 Entry
  const userDriver2: DriverEntry = {
    name: d2?.name || 'Seu Piloto 2',
    team: 'Seu Time',
    color: '#FF6B6B',
    pace: (d2?.pace || 83) + (chassisRating * 0.15) + (engineerRating * 0.1) + totalComboBonus / 3 + supportBonus + legacyBonus,
    consistency: (d2?.consistency || 82) + (bossRating * 0.08) + totalComboBonus / 4,
    chuva: (d2?.chuva || 83) + ((wetSpecialist?.chuva || 85) * 0.05) + totalComboBonus / 4,
    aggressiveness: d2?.aggressiveness || 85,
    reliability: reliabilityScore,
    isUser: true,
    driverIndex: 2,
  };

  // Compile active grid of 12 drivers
  const gridDrivers: DriverEntry[] = [...RIVAL_DRIVERS, userDriver1, userDriver2];

  // Standings tracker
  // Key: Driver Name
  const standingsPoints: Record<string, number> = {};
  const standingsWins: Record<string, number> = {};
  const standingsPodiums: Record<string, number> = {};
  const standsDnfCount: Record<string, number> = {};

  gridDrivers.forEach(d => {
    standingsPoints[d.name] = 0;
    standingsWins[d.name] = 0;
    standingsPodiums[d.name] = 0;
    standsDnfCount[d.name] = 0;
  });

  const teamPoints: Record<string, number> = {
    'Ferrari 2004': 0,
    'McLaren 1988': 0,
    'Red Bull 2023': 0,
    'Mercedes 2021': 0,
    'Williams 1992': 0,
    'Seu Time': 0,
  };

  const raceResults: SimulationRaceResult[] = [];
  const narrationHighlights: string[] = [];

  // F1 Points System: 1st through 10th
  const f1Points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  let championStoryTriggered = false;

  // 3. Loop over courses
  CIRCUITS.forEach((race, raceIdx) => {
    const driverRaceScores: { driver: DriverEntry; score: number; dnf: boolean; dnfReason?: string }[] = [];

    gridDrivers.forEach(drv => {
      // Base performance formula
      let baseGridScore = 0;

      // Track style multiplier
      let trackMultiplier = 1;
      if (race.type === 'veloz') {
        // High top speed matters
        const topSpeedFactor = drv.isUser ? (chassis?.top_speed || 85) : 95;
        baseGridScore += drv.pace * 0.5 + topSpeedFactor * 0.5;
      } else if (race.type === 'rua' || race.type === 'técnico') {
        // Aerodynamics and driver consistency matter
        const aeroFactor = drv.isUser ? ((chassis?.aerodynamics || 85) * 0.4 + stratFactor * 0.3) : 94;
        baseGridScore += drv.pace * 0.5 + drv.consistency * 0.3 + aeroFactor * 0.2;
      } else {
        // Classic well-balanced layout
        baseGridScore += drv.pace * 0.6 + drv.consistency * 0.4;
      }

      // Wet weather check
      if (race.isWet) {
        // Heavy rain GP! Wet weather skills shine
        const wetAdvantage = drv.isUser ? (userDriver1.chuva * 0.7 + (wetSpecialist?.chuva || 80) * 0.3) : drv.chuva;
        baseGridScore = (wetAdvantage * 0.8) + (drv.pace * 0.2) + 12;

        if (drv.isUser && wetSpecialist) {
          // Extra wet specialist narrative trigger
          if (raceIdx === 0 && !championStoryTriggered) {
            narrationHighlights.push(`GP do Brasil sob temporal! O Especialista em Chuva (${wetSpecialist.name}) deu feedbacks cruciais nas curvas de Interlagos, elevando o acerto.`);
          }
        }
      }

      // Apply controlled randomness (between -8 and +8)
      const rngFactor = (Math.random() - 0.5) * 16;
      let finalScore = baseGridScore + rngFactor;

      // Calculate DNF likelihood
      // Aggressiveness increases risk slightly. Reliability decreases risk.
      const dnfRoll = Math.random() * 100;
      let isDnf = false;
      let dnfReason = '';

      const effectiveReliability = drv.reliability;
      if (dnfRoll < (100 - effectiveReliability) * 0.15 + (drv.aggressiveness * 0.04)) {
        isDnf = true;
        standsDnfCount[drv.name] += 1;
        const reasons = [
          'Pane Elétrica',
          'Estouro de Pneu',
          'Vazamento de Óleo',
          'Colisão na largada',
          'Superaquecimento do Motor',
          'Rodada na caixa de brita'
        ];
        dnfReason = reasons[Math.floor(Math.random() * reasons.length)];
      }

      driverRaceScores.push({
        driver: drv,
        score: isDnf ? -999 : finalScore,
        dnf: isDnf,
        dnfReason,
      });
    });

    // Sort this race results from highest score to lowest
    driverRaceScores.sort((a, b) => b.score - a.score);

    // Prepare Podium list & detailed positions
    const podium: { driver: string; team: string; color: string }[] = [];
    const positions: { driver: string; team: string; points: number; color: string; dnf: boolean; incident?: string }[] = [];

    driverRaceScores.forEach((item, posIdx) => {
      const isDnf = item.dnf;
      // Assign points
      const pointsEarned = (!isDnf && posIdx < 10) ? f1Points[posIdx] : 0;

      standingsPoints[item.driver.name] += pointsEarned;
      teamPoints[item.driver.team] += pointsEarned;

      if (!isDnf && posIdx === 0) {
        standingsWins[item.driver.name] += 1;
      }
      if (!isDnf && posIdx < 3) {
        standingsPodiums[item.driver.name] += 1;
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
      });
    });

    // Store GP result
    raceResults.push({
      raceName: race.name,
      podium,
      positions,
    });

    // Add race highlight narration occasionally
    const winner = positions[0];
    const userBestPos = positions.findIndex(p => p.team === 'Seu Time');
    if (race.name === 'Grande Prêmio da Bélgica') {
      if (userBestPos === 0) {
        narrationHighlights.push(`Vitória mágica em Spa-Francorchamps! ${positions[userBestPos].driver} escalou o grid de forma lendária cortando a Eau Rouge sob gritos de emoção na mureta.`);
      } else if (userBestPos < 3) {
        narrationHighlights.push(`Pódio disputado na Bélgica! Seu carro demonstrou ótima estabilidade nas curvas rápidas de Spa para cruzar em P${userBestPos + 1}.`);
      } else {
        const dnfDetect = positions.find(p => p.team === 'Seu Time' && p.dnf);
        if (dnfDetect) {
          narrationHighlights.push(`Frustração em Spa: ${dnfDetect.driver} abandonou por conta de ${dnfDetect.incident}.`);
        } else {
          narrationHighlights.push(`Ritmo conservador em Spa-Francorchamps. ${positions[userBestPos].driver} garantiu pontos importantes fechando em P${userBestPos + 1}.`);
        }
      }
    }

    if (race.name === 'Grande Prêmio da Grã-Bretanha') {
      const hasDnf = positions.some(p => p.team === 'Seu Time' && p.dnf);
      if (hasDnf) {
        narrationHighlights.push(`Drama na Grã-Bretanha: Contatos acalorados na curva Copse causaram avaria grave mecânica.`);
      } else {
        narrationHighlights.push(`Aero de alto impacto em Silverstone: Seu Engenheiro Chefe (${engineer?.name || 'equipe'}) acertou no arrasto reduzindo tempo de volta.`);
      }
    }

    if (raceIdx === CIRCUITS.length - 1) { // Final showdown
      narrationHighlights.push(`Grande Finale na pista crepuscular de Abu Dhabi! Disputas roda a roda decidem o título mundial da temporada.`);
    }
  });

  // 4. Format final Standings
  const finalDriverStandings = gridDrivers.map(drv => {
    return {
      driver: drv.name,
      team: drv.team,
      points: standingsPoints[drv.name],
      isUser: drv.isUser,
      color: drv.color,
      wins: standingsWins[drv.name],
      podiums: standingsPodiums[drv.name],
      dnfCount: standsDnfCount[drv.name],
    };
  }).sort((a, b) => b.points - a.points);

  const finalTeamStandings = Object.keys(teamPoints).map(tName => {
    const isU = tName === 'Seu Time';
    const firstDrvOfTeam = gridDrivers.find(d => d.team === tName);
    return {
      team: tName,
      points: teamPoints[tName],
      isUser: isU,
      color: isU ? '#FF3E3E' : (firstDrvOfTeam?.color || '#94A3B8'),
    };
  }).sort((a, b) => b.points - a.points);

  // Generate Championship narration wrap up
  const leadDriver = finalDriverStandings[0];
  const userLeadDriver = finalDriverStandings.find(d => d.isUser);
  const userTeamPos = finalTeamStandings.findIndex(t => t.isUser);

  if (leadDriver.isUser) {
    narrationHighlights.unshift(`🏆 HISTÓRICO! ${leadDriver.driver} é coroado CAMPEÃO MUNDIAL de Fórmula 1 com uma campanha brilhante de ${leadDriver.wins} vitórias pelo Seu Time!`);
  } else {
    narrationHighlights.unshift(`🏆 ${leadDriver.driver} (${leadDriver.team}) faturou o caneco de campeão de pilotos com ${leadDriver.points} pontos. Seu melhor piloto (${userLeadDriver?.driver}) fechou em excelente P${finalDriverStandings.findIndex(d => d.isUser) + 1}.`);
  }

  if (userTeamPos === 0) {
    narrationHighlights.unshift(`🔥 TÍTULO DOS CONSTRUTORES! Seu Time superou as maiores lendas da história com ${finalTeamStandings[0].points} pontos no topo do mundo do Paddock!`);
  } else {
    narrationHighlights.push(`No Campeonato de Construtores, sua marca fechou em ${userTeamPos + 1}º lugar, marcando ${teamPoints['Seu Time']} pontos contra lendas do asfalto.`);
  }

  return {
    raceResults,
    driverStandings: finalDriverStandings,
    teamStandings: finalTeamStandings,
    narrationHighlights,
  };
}
