/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Driver {
  id: string;
  name: string;
  country: string;
  titles: number;
  wins: number;
  podiums: number;
  poles: number;
  rating_geral: number;
  pace: number;
  consistency: number;
  chuva: number; // Performance in wet weather
  aggressiveness: number;
  reliability: number;
  avatar?: string;
  description: string;
}

export interface TeamBoss {
  id: string;
  name: string;
  country: string;
  rating_geral: number;
  leadership: number;
  pressure_handling: number;
  prestige: number;
  description: string;
}

export interface Chassis {
  id: string;
  name: string;
  engine: string;
  rating_geral: number;
  top_speed: number;
  aerodynamics: number;
  conducao: number; // drivability
  reliability: number;
  description: string;
}

export interface Strategist {
  id: string;
  name: string;
  rating_geral: number;
  calculated_risk: number;
  pit_tactics: number;
  reactivity: number;
  description: string;
}

export interface Engineer {
  id: string;
  name: string;
  rating_geral: number;
  aerodynamics: number;
  innovation: number;
  weight_saving: number;
  description: string;
}

export type SlotType = 'driver_1' | 'driver_2' | 'reserve_1' | 'reserve_2' | 'wet_specialist' | 'legacy_wildcard' | 'team_boss' | 'chassis' | 'strategist' | 'engineer';

export interface GameSlot {
  id: SlotType;
  name: string;
  description: string;
  icon: string;
  type: 'driver' | 'boss' | 'chassis' | 'strategist' | 'engineer';
  filledWith: any | null; // Selected entity
}

export type DifficultyMode = 'normal' | 'hard' | 'underdog'; // Hard hides numeric ratings, Underdog mode uses worse teams with buffs

export interface TeamCombination {
  season: number;
  teamId: string;
  teamName: string;
  logoColor: string; // Tailwind class color
  borderColor: string;
  textColor: string;
  drivers: Driver[];
  boss: TeamBoss;
  chassis: Chassis;
  strategist: Strategist;
  engineer: Engineer;
  isWorst?: boolean;
}

export interface Race {
  name: string;
  country: string;
  flag: string;
  type: '高速' | 'テクニカル' | 'モナコ' | '雨' | 'clássico' | 'técnico' | 'veloz' | 'chuva' | 'rua'; // Track styles
  isWet: boolean;
  description: string;
}

export interface CompetitorResult {
  teamName: string;
  driver1Name: string;
  driver2Name: string;
  points: number;
  pointsConstructors: number;
}

export interface SimulationRaceResult {
  raceName: string;
  podium: {
    driver: string;
    team: string;
    color: string;
  }[];
  positions: {
    driver: string;
    team: string;
    points: number;
    color: string;
    dnf: boolean;
    incident?: string;
    trackEffect?: string;
    stress?: number;
  }[];
}

export interface ActiveCombo {
  season: number;
  teamId: string;
  teamName: string;
  logoColor: string;
  borderColor: string;
  textColor: string;
}

export interface ComboBonus {
  name: string;
  description: string;
  bonusValue: number;
  icon: string;
}
