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

  // Standings tracker
  const standingsPoints: Record<string, number> = {};
  const standingsWins: Record<string, number> = {};
  const standingsPodiums: Record<string, number> = {};
  const standsDnfCount: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};

  finalPlayers.forEach(player => {
    const pSlots = player.slots;
    const d1 = pSlots['driver_1'];
    const d2 = pSlots['driver_2'];
    const reserve1 = pSlots['reserve_1'];
    const reserve2 = pSlots['reserve_2'];
    const wetSpecialist = pSlots['wet_specialist'];
    const legacyWildcard = pSlots['legacy_wildcard'];
    const boss = pSlots['team_boss'];
    const chassis = pSlots['chassis'];
    const strategist = pSlots['strategist'];
    const engineer = pSlots['engineer'];

    // Check which combos are active
    const combos = detectCombos(pSlots);
    const totalComboBonus = combos.reduce((acc, c) => acc + c.bonusValue, 0);

    // Compute player team baseline parameters
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
      name: d1?.name || `${player.name} Piloto 1`,
      team: player.teamName,
      color: player.color,
      pace: (d1?.pace || 85) + (chassisRating * 0.15) + (engineerRating * 0.1) + totalComboBonus / 3 + supportBonus + legacyBonus,
      consistency: (d1?.consistency || 85) + (bossRating * 0.08) + totalComboBonus / 4,
      chuva: (d1?.chuva || 85) + ((wetSpecialist?.chuva || 85) * 0.05) + totalComboBonus / 4,
      aggressiveness: d1?.aggressiveness || 85,
      reliability: reliabilityScore,
      isUser: true,
      driverIndex: 1,
      playerId: player.id,
      slots: pSlots,
    };

    // Build User Driver 2 Entry
    const userDriver2: DriverEntry = {
      name: d2?.name || `${player.name} Piloto 2`,
      team: player.teamName,
      color: player.color,
      pace: (d2?.pace || 83) + (chassisRating * 0.15) + (engineerRating * 0.1) + totalComboBonus / 3 + supportBonus + legacyBonus,
      consistency: (d2?.consistency || 82) + (bossRating * 0.08) + totalComboBonus / 4,
      chuva: (d2?.chuva || 83) + ((wetSpecialist?.chuva || 85) * 0.05) + totalComboBonus / 4,
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
  const gridDrivers: DriverEntry[] = [...RIVAL_DRIVERS, ...userDrivers];

  gridDrivers.forEach(d => {
    standingsPoints[d.name] = 0;
    standingsWins[d.name] = 0;
    standingsPodiums[d.name] = 0;
    standsDnfCount[d.name] = 0;
    teamPoints[d.team] = 0;
  });

  const raceResults: SimulationRaceResult[] = [];

  // F1 Points System: 1st through 10th
  const f1Points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  // 3. Loop over courses
  CIRCUITS.forEach((race, raceIdx) => {
    const driverRaceScores: { driver: DriverEntry; score: number; dnf: boolean; dnfReason?: string; trackEffect?: string }[] = [];

    gridDrivers.forEach(drv => {
      // Base performance formula
      let baseGridScore = 0;

      // Track style multiplier
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

      // Wet weather check
      if (race.isWet) {
        const pSlots = drv.slots;
        const wetSpecialistChuva = pSlots?.['wet_specialist']?.chuva || 80;
        const wetAdvantage = drv.isUser ? (drv.chuva * 0.7 + wetSpecialistChuva * 0.3) : drv.chuva;
        baseGridScore = (wetAdvantage * 0.8) + (drv.pace * 0.2) + 12;

        if (drv.isUser && pSlots?.['wet_specialist']) {
          const wetSpecialist = pSlots['wet_specialist'];
          if (raceIdx === 0 && !championStoryTriggered) {
            narrationHighlights.push(`GP do Brasil sob temporal! O Especialista em Chuva (${wetSpecialist.name}) deu feedbacks cruciais nas curvas de Interlagos para a escuderia ${drv.team}, melhorando o acerto.`);
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
      } else if (race.type === 'clássico') {
        if (drv.consistency >= 92 && drv.reliability >= 92) {
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
      const minPaceOrConsistency = Math.min(drv.pace, drv.consistency);
      const isLowRating = minPaceOrConsistency < 60;
      const lowRatingPenalty = isLowRating ? (15 + (60 - minPaceOrConsistency) * 0.6) : 0;

      // 3. Wet track & High Aggressiveness penalty
      const wetTrackAggressivenessPenalty = (race.isWet && drv.aggressiveness >= 90) ? 8.0 : 0;

      // 4. Random race-specific weather/incident risk spike (e.g. Monza, Monaco, Spa)
      const raceIncidentRisk = ((raceIdx * 7) % 10) < 3 ? 5.5 : 0;

      // 5. Difficulty mode multiplier for player drivers to generate challenge
      const userMultiplier = drv.isUser ? (difficultyMode === 'hard' ? 1.6 : (difficultyMode === 'underdog' ? 1.3 : 1.0)) : 1.0;

      const totalDnfChance = (baseReliabilityChance + baseAggressivenessChance + roundFatiguePenalty + lowRatingPenalty + wetTrackAggressivenessPenalty + raceIncidentRisk) * userMultiplier;

      if (dnfRoll < totalDnfChance) {
        isDnf = true;
        standsDnfCount[drv.name] += 1;
        
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

    // Sort this race results from highest score to lowest
    driverRaceScores.sort((a, b) => b.score - a.score);

    // Prepare Podium list & detailed positions
    const podium: { driver: string; team: string; color: string }[] = [];
    const positions: { driver: string; team: string; points: number; color: string; dnf: boolean; incident?: string; trackEffect?: string }[] = [];

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
        trackEffect: item.trackEffect
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
    return {
      driver: drv.name,
      team: drv.team,
      points: standingsPoints[drv.name],
      isUser: drv.isUser,
      color: drv.color,
      wins: standingsWins[drv.name],
      podiums: standingsPodiums[drv.name],
      dnfCount: standsDnfCount[drv.name],
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
