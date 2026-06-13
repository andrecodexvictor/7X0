/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamCombination, Race, GameSlot } from './types';
import historicalStatsRaw from './data/f1_driver_season_stats_full.json';

export const GAME_SLOTS: GameSlot[] = [
  {
    id: 'driver_1',
    name: 'Piloto Titular 1',
    description: 'Seu primeiro piloto principal. Liderará a busca por vitórias.',
    icon: 'User',
    type: 'driver',
    filledWith: null,
  },
  {
    id: 'driver_2',
    name: 'Piloto Titular 2',
    description: 'O segundo piloto titular. Fundamental para somar pontos no Mundial de Construtores.',
    icon: 'UserCheck',
    type: 'driver',
    filledWith: null,
  },
  {
    id: 'reserve_1',
    name: 'Piloto Reserva',
    description: 'Piloto reserva e de suporte. Traz consistência e estabilidade caso precise de cobertura.',
    icon: 'Shield',
    type: 'driver',
    filledWith: null,
  },
  {
    id: 'engine',
    name: 'Unidade de Potência / Motor',
    description: 'Determina a aceleração, velocidade final e robustez do propulsor.',
    icon: 'Zap',
    type: 'engine',
    filledWith: null,
  },
  {
    id: 'chassis',
    name: 'Carro / Chassi',
    description: 'A máquina! Determina a velocidade máxima base, aerodinâmica e confiabilidade técnica.',
    icon: 'Cpu',
    type: 'chassis',
    filledWith: null,
  },
  {
    id: 'team_boss',
    name: 'Chefe de Equipe',
    description: 'Comanda a liderança, gerência política do paddock e acalma rivalidades na pista.',
    icon: 'Award',
    type: 'boss',
    filledWith: null,
  },
  {
    id: 'engineer',
    name: 'Engenheiro Chefe',
    description: 'Responsável pelo desenvolvimento aerodinâmico e refinamento mecânico do carro.',
    icon: 'Wrench',
    type: 'engineer',
    filledWith: null,
  },
  {
    id: 'strategist',
    name: 'Estrategista',
    description: 'O cérebro na mureta de boxes. Inteligência de pit stops e chamadas em safety-cars.',
    icon: 'Compass',
    type: 'strategist',
    filledWith: null,
  },
];

export const CIRCUITS: Race[] = [
  {
    name: 'Grande Prêmio da Austrália',
    country: 'Austrália 🇦🇺',
    flag: 'AU',
    type: 'clássico',
    isWet: false,
    description: 'Albert Park. Circuito de semi-rua veloz e fluído, exigindo grande equilíbrio mecânico e ritmo.',
  },
  {
    name: 'Grande Prêmio do Japão',
    country: 'Japão 🇯🇵',
    flag: 'JP',
    type: 'técnico',
    isWet: false,
    description: 'Suzuka. Formato de "oito", curvas desafiadoras de alta velocidade e exigência extrema da linha ideal.',
  },
  {
    name: 'Grande Prêmio do Azerbaijão',
    country: 'Azerbaijão 🇦🇿',
    flag: 'AZ',
    type: 'rua',
    isWet: false,
    description: 'Baku. A reta mais longa do campeonato combinada com o trecho estreito e claustrofóbico do Castelo.',
  },
  {
    name: 'Grande Prêmio de Mônaco',
    country: 'Mônaco 🇲🇨',
    flag: 'MC',
    type: 'rua',
    isWet: false,
    description: 'Monte Carlo. Ruas apertadas, sem margem de erro, onde a aerodinâmica e o estrategista dominam.',
  },
  {
    name: 'Grande Prêmio da Espanha',
    country: 'Espanha 🇪🇸',
    flag: 'ES',
    type: 'técnico',
    isWet: false,
    description: 'Barcelona-Catalunya. Pista de testes clássica que pune duramente pneus gastos e erros de aerodinâmica.',
  },
  {
    name: 'Grande Prêmio do Canadá',
    country: 'Canadá 🇨🇦',
    flag: 'CA',
    type: 'técnico',
    isWet: true,
    description: 'Montreal. Circuito Gilles Villeneuve. Retas longas, chicanes duras e o famoso Muro dos Campeões.',
  },
  {
    name: 'Grande Prêmio da Áustria',
    country: 'Áustria 🇦🇹',
    flag: 'AT',
    type: 'veloz',
    isWet: false,
    description: 'Red Bull Ring. Elevações severas, poucas curvas e frenagens fortíssimas nas montanhas da Estíria.',
  },
  {
    name: 'Grande Prêmio da Grã-Bretanha',
    country: 'Reino Unido 🇬🇧',
    flag: 'GB',
    type: 'clássico',
    isWet: false,
    description: 'Silverstone. Curvas de alta velocidade Copse, Maggots e Becketts que testam o limite físico de pilotos.',
  },
  {
    name: 'Grande Prêmio da Hungria',
    country: 'Hungria 🇭🇺',
    flag: 'HU',
    type: 'técnico',
    isWet: false,
    description: 'Hungaroring. Conhecido como "Mônaco sem muros", travado, sinuoso e extremamente físico sob forte calor.',
  },
  {
    name: 'Grande Prêmio da Bélgica',
    country: 'Bélgica 🇧🇪',
    flag: 'BE',
    type: 'veloz',
    isWet: true,
    description: 'Spa-Francorchamps. Eau Rouge, tempo instável e velocidades extremas nas montanhas das Ardenas.',
  },
  {
    name: 'Grande Prêmio dos Países Baixos',
    country: 'Países Baixos 🇳🇱',
    flag: 'NL',
    type: 'técnico',
    isWet: false,
    description: 'Zandvoort. Curvas de inclinação tipo "oval" (banking), dunas de areia desafiadoras e pista estreita clássica.',
  },
  {
    name: 'Grande Prêmio da Itália',
    country: 'Itália 🇮🇹',
    flag: 'IT',
    type: 'veloz',
    isWet: false,
    description: 'Monza. O Templo da Velocidade. Pé embaixo o tempo todo. Vence o motor potente e o baixo arrasto.',
  },
  {
    name: 'Grande Prêmio de Cingapura',
    country: 'Cingapura 🇸🇬',
    flag: 'SG',
    type: 'rua',
    isWet: true,
    description: 'Marina Bay. Corrida noturna tropical ultra-desgastante de alta umidade, frenagens e calor infernal.',
  },
  {
    name: 'Grande Prêmio dos EUA',
    country: 'Estados Unidos 🇺🇸',
    flag: 'US',
    type: 'clássico',
    isWet: false,
    description: 'Austin. Grande subida na icônica curva 1 e sequências rítmicas de "esses" inspiradas em Silverstone.',
  },
  {
    name: 'Grande Prêmio de Interlagos',
    country: 'Brasil 🇧🇷',
    flag: 'BR',
    type: 'clássico',
    isWet: true,
    description: 'São Paulo. Curvas de alta no miolo, subida cega dos boxes e atmosfera ensandecida com risco de chuva.',
  },
  {
    name: 'Grande Prêmio de Abu Dhabi',
    country: 'Emirados Árabes Unidos 🇦🇪',
    flag: 'AE',
    type: 'veloz',
    isWet: false,
    description: 'Yas Marina. Luxuosa corrida crepuscular, término sob refletores com foco em aceleração e tração.',
  },
  {
    name: 'Grande Prêmio do Bahrein',
    country: 'Bahrein 🇧🇭',
    flag: 'BH',
    type: 'veloz',
    isWet: false,
    description: 'Sakhir. Circuito maravilhoso no deserto com frenagens agressivas e foco absoluto na tração.',
  },
  {
    name: 'Grande Prêmio da Arábia Saudita',
    country: 'Arábia Saudita 🇸🇦',
    flag: 'SA',
    type: 'rua',
    isWet: false,
    description: 'Jeddah Corniche. O circuito de rua mais rápido do mundo, ladeado por muros colados e curvas cegas extremas.',
  },
  {
    name: 'Grande Prêmio de Miami',
    country: 'Estados Unidos 🇺🇸',
    flag: 'US',
    type: 'rua',
    isWet: false,
    description: 'Autódromo Internacional de Miami. Pista rítmica ao redor do Hard Rock Stadium com setor apertado e chicanes técnicas.',
  },
  {
    name: 'Grande Prêmio da China',
    country: 'China 🇨🇳',
    flag: 'CN',
    type: 'técnico',
    isWet: true,
    description: 'Xangai. Curva icônica em caracol de abertura, retas inacreditáveis e exigência total nos pneus dianteiros.',
  },
  {
    name: 'Grande Prêmio da Emilia-Romagna',
    country: 'Itália 🇮🇹',
    flag: 'IT',
    type: 'clássico',
    isWet: true,
    description: 'Imola. O histórico circuito Enzo e Dino Ferrari, com ondulações e as curvas lendárias de Tamburello e Acque Minerali.',
  },
  {
    name: 'Grande Prêmio de Las Vegas',
    country: 'Estados Unidos 🇺🇸',
    flag: 'US',
    type: 'rua',
    isWet: false,
    description: 'Las Vegas Strip. Corrida noturna congelante e ultra-rápida passando pelas fontes do Bellagio e da Esfera.',
  },
  {
    name: 'Grande Prêmio do Catar',
    country: 'Catar 🇶🇦',
    flag: 'QA',
    type: 'veloz',
    isWet: false,
    description: 'Losail. Pista plana de ritmo fluido, repleta de curvas de altíssima velocidade constante que moem os pneus.',
  },
  {
    name: 'Grande Prêmio do México',
    country: 'México 🇲🇽',
    flag: 'MX',
    type: 'técnico',
    isWet: false,
    description: 'Autódromo Hermanos Rodríguez. Pista a mais de 2.200 metros de altitude onde o ar rarefeito anula a pressão aerodinâmica.',
  },
];

const HARDCODED_SEASONS_TEAMS: TeamCombination[] = [
  {
    season: 1988,
    teamId: 'mclaren_1988',
    teamName: 'McLaren-Honda',
    logoColor: 'from-[#FF5F00] to-white', // Papaya / White original rocket era
    borderColor: 'border-[#FF5F00]',
    textColor: 'text-[#FF5F00]',
    drivers: [
      {
        id: 'senna_1988',
        name: 'Ayrton Senna',
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
        description: 'Rei de Mônaco, das poles e maior piloto sob chuva da história. Determinação inigualável.',
      },
      {
        id: 'prost_1988',
        name: 'Alain Prost',
        country: 'França 🇫🇷',
        titles: 4,
        wins: 51,
        podiums: 106,
        poles: 33,
        rating_geral: 98,
        pace: 96,
        consistency: 100,
        chuva: 88,
        aggressiveness: 80,
        reliability: 98,
        description: 'O Professor. Cálculo estratégico frio, suavidade mecânica e consistência impressionante.',
      }
    ],
    boss: {
      id: 'ron_dennis_1988',
      name: 'Ron Dennis',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 96,
      leadership: 99,
      pressure_handling: 94,
      prestige: 98,
      description: 'Perfeccionista implacável, criador da dinastia moderna da McLaren e gerador de altíssima disciplina.',
    },
    chassis: {
      id: 'mp4_4_1988',
      name: 'McLaren MP4/4',
      engine: 'Honda V6 Turbo (V6t)',
      rating_geral: 99,
      top_speed: 98,
      aerodynamics: 100,
      conducao: 99,
      reliability: 98,
      description: 'O carro mais dominante da história do esporte. 15 vitórias em 16 corridas disputadas.',
    },
    strategist: {
      id: 'neil_oatley_1988',
      name: 'Neil Oatley',
      rating_geral: 93,
      calculated_risk: 92,
      pit_tactics: 94,
      reactivity: 91,
      description: 'Engenheiro de mureta clássico com visão tática serena, garantindo corridas sob controle rígido.',
    },
    engineer: {
      id: 'steve_nichols_1988',
      name: 'Steve Nichols',
      rating_geral: 94,
      aerodynamics: 95,
      innovation: 93,
      weight_saving: 96,
      description: 'Projetista-chefe do icônico MP4/4. Trouxe um centro de gravidade extremamente baixo para o chassi.',
    }
  },
  {
    season: 2004,
    teamId: 'ferrari_2004',
    teamName: 'Ferrari',
    logoColor: 'from-[#EF1A2D] to-black', // Ferrari Red
    borderColor: 'border-[#EF1A2D]',
    textColor: 'text-[#EF1A2D]',
    drivers: [
      {
        id: 'schumacher_2004',
        name: 'Michael Schumacher',
        country: 'Alemanha 🇩🇪',
        titles: 7,
        wins: 91,
        podiums: 155,
        poles: 68,
        rating_geral: 99,
        pace: 99,
        consistency: 99,
        chuva: 99,
        aggressiveness: 92,
        reliability: 99,
        description: 'Kaiser. Sete vezes campeão, ética de trabalho impecável e velocidade em ritmo de classificação constante.',
      },
      {
        id: 'barrichello_2004',
        name: 'Rubens Barrichello',
        country: 'Brasil 🇧🇷',
        titles: 0,
        wins: 11,
        podiums: 68,
        poles: 14,
        rating_geral: 90,
        pace: 89,
        consistency: 91,
        chuva: 94,
        aggressiveness: 80,
        reliability: 93,
        description: 'Trabalho de equipe brilhante, pilotagem extremamente técnica e exímio mestre na chuva.',
      }
    ],
    boss: {
      id: 'jean_todt_2004',
      name: 'Jean Todt',
      country: 'França 🇫🇷',
      rating_geral: 98,
      leadership: 99,
      pressure_handling: 98,
      prestige: 99,
      description: 'Líder supremo da era mais vitoriosa da Ferrari. Blindou Maranello contra pressões externas.',
    },
    chassis: {
      id: 'f2004',
      name: 'Ferrari F2004',
      engine: 'Ferrari 053 V10 Tipo 3.0',
      rating_geral: 99,
      top_speed: 100,
      aerodynamics: 98,
      conducao: 99,
      reliability: 100,
      description: 'A joia do V10 gritador. Quebrou recordes de pista de forma assustadora e impecável confiabilidade.',
    },
    strategist: {
      id: 'ross_brawn_2004',
      name: 'Ross Brawn',
      rating_geral: 99,
      calculated_risk: 99,
      pit_tactics: 100,
      reactivity: 98,
      description: 'O maior estrategista da F1. Capaz de mudar rotas no meio da prova para ganhar corridas de surpresa.',
    },
    engineer: {
      id: 'rory_byrne_2004',
      name: 'Rory Byrne',
      rating_geral: 98,
      aerodynamics: 98,
      innovation: 97,
      weight_saving: 98,
      description: 'Gênio sul-africano do design. Elaborou carros brilhantes e perfeitamente equilibrados em aderência.',
    }
  },
  {
    season: 2023,
    teamId: 'redbull_2023',
    teamName: 'Red Bull Racing',
    logoColor: 'from-[#0600EF] to-[#FFCC00]', // Red Bull navy & yellow
    borderColor: 'border-[#0600EF]',
    textColor: 'text-[#0600EF]',
    drivers: [
      {
        id: 'verstappen_2023',
        name: 'Max Verstappen',
        country: 'Holanda 🇳🇱',
        titles: 3,
        wins: 62,
        podiums: 106,
        poles: 40,
        rating_geral: 99,
        pace: 100,
        consistency: 99,
        chuva: 98,
        aggressiveness: 94,
        reliability: 98,
        description: 'Fria precisão matemática sob pressão. Ganhou 19 de 22 corridas em 2023 com foco absoluto.',
      },
      {
        id: 'perez_2023',
        name: 'Sergio Pérez',
        country: 'México 🇲🇽',
        titles: 0,
        wins: 6,
        podiums: 39,
        poles: 3,
        rating_geral: 85,
        pace: 84,
        consistency: 82,
        chuva: 88,
        aggressiveness: 87,
        reliability: 88,
        description: 'Rei das pistas de rua e excelente protetor de pneus. Apoio estratégico perfeito em pistas quentes.',
      }
    ],
    boss: {
      id: 'christian_horner_2023',
      name: 'Christian Horner',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 94,
      leadership: 95,
      pressure_handling: 90,
      prestige: 93,
      description: 'Líder focado em defender sua equipe a todo custo e mestre em rivalidades políticas de paddock.',
    },
    chassis: {
      id: 'rb19_2023',
      name: 'Red Bull RB19',
      engine: 'Honda-RBPT V6 Turbo híbrido',
      rating_geral: 99,
      top_speed: 100,
      aerodynamics: 100,
      conducao: 98,
      reliability: 99,
      description: 'Uma eficiência aerodinâmica inacreditável com o DRS mais poderoso do grids modernos.',
    },
    strategist: {
      id: 'hannah_schmitz_2023',
      name: 'Hannah Schmitz',
      rating_geral: 98,
      calculated_risk: 98,
      pit_tactics: 99,
      reactivity: 99,
      description: 'Diretora de estratégia com decisões audaciosas e certeiras, mudando o rumo do campeonato.',
    },
    engineer: {
      id: 'adrian_newey_2023',
      name: 'Adrian Newey',
      rating_geral: 99,
      aerodynamics: 100,
      innovation: 99,
      weight_saving: 98,
      description: 'Gênio indiscutível de layout de fluxo de ar. O engenheiro mais vitorioso da história da F1.',
    }
  },
  {
    season: 1992,
    teamId: 'williams_1992',
    teamName: 'Williams',
    logoColor: 'from-[#002B49] to-[#FFCC00]', // Old school williams blue/yellow
    borderColor: 'border-[#002B49]',
    textColor: 'text-[#002B49]',
    drivers: [
      {
        id: 'mansell_1992',
        name: 'Nigel Mansell',
        country: 'Reino Unido 🇬🇧',
        titles: 1,
        wins: 31,
        podiums: 59,
        poles: 32,
        rating_geral: 95,
        pace: 96,
        consistency: 90,
        chuva: 91,
        aggressiveness: 97,
        reliability: 88,
        description: 'O Leão. Determinação física impressionante, estilo de agressividade insana e força nas curvas rápidas.',
      },
      {
        id: 'patrese_1992',
        name: 'Riccardo Patrese',
        country: 'Itália 🇮🇹',
        titles: 0,
        wins: 6,
        podiums: 37,
        poles: 8,
        rating_geral: 87,
        pace: 86,
        consistency: 89,
        chuva: 85,
        aggressiveness: 81,
        reliability: 90,
        description: 'Piloto confiável de equipe com experiência maciça e pilotagem limpa e conservadora.',
      }
    ],
    boss: {
      id: 'frank_williams_1992',
      name: 'Frank Williams',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 96,
      leadership: 98,
      pressure_handling: 97,
      prestige: 98,
      description: '毅 Lenda pura de superação física e determinação. Construiu um império privado a partir de garagem.',
    },
    chassis: {
      id: 'fw14b_1992',
      name: 'Williams FW14B',
      engine: 'Renault 3.5 V10',
      rating_geral: 98,
      top_speed: 95,
      aerodynamics: 99,
      conducao: 97,
      reliability: 89,
      description: 'O computador sobre rodas. Suspensão ativa, controle de tração pioneiro e câmbio semiautomático.',
    },
    strategist: {
      id: 'david_brown_1992',
      name: 'David Brown',
      rating_geral: 88,
      calculated_risk: 86,
      pit_tactics: 89,
      reactivity: 87,
      description: 'Calmo engenheiro de pista, ajudante fundamental da agressividade tática do Mansell.',
    },
    engineer: {
      id: 'adrian_newey_1992',
      name: 'Adrian Newey',
      rating_geral: 99,
      aerodynamics: 100,
      innovation: 99,
      weight_saving: 97,
      description: 'Em sua juventude, já desenhava canais aerodinâmicos impensáveis desafiando a gravidade da pista.',
    }
  },
  {
    season: 2021,
    teamId: 'mercedes_2021',
    teamName: 'Mercedes-AMG',
    logoColor: 'from-[#00A19B] to-black', // Petronas Teal
    borderColor: 'border-[#00A19B]',
    textColor: 'text-[#00A19B]',
    drivers: [
      {
        id: 'hamilton_2021',
        name: 'Lewis Hamilton',
        country: 'Reino Unido 🇬🇧',
        titles: 7,
        wins: 105,
        podiums: 201,
        poles: 104,
        rating_geral: 98,
        pace: 99,
        consistency: 98,
        chuva: 98,
        aggressiveness: 89,
        reliability: 98,
        description: 'O maior vencedor em pole positions, pódios e vitórias da história da Fórmula 1.',
      },
      {
        id: 'bottas_2021',
        name: 'Valtteri Bottas',
        country: 'Finlândia 🇫🇮',
        titles: 0,
        wins: 10,
        podiums: 67,
        poles: 20,
        rating_geral: 87,
        pace: 90,
        consistency: 85,
        chuva: 75,
        aggressiveness: 76,
        reliability: 94,
        description: 'Velocidade avassaladora nas voltas rápidas de classificação e companheiro de equipe perfeito.',
      }
    ],
    boss: {
      id: 'toto_wolff_2021',
      name: 'Toto Wolff',
      country: 'Áustria 🇦🇹',
      rating_geral: 95,
      leadership: 97,
      pressure_handling: 90,
      prestige: 96,
      description: 'Líder focado em eficiência empresarial impecável e detentor de múltiplos recordes industriais.',
    },
    chassis: {
      id: 'w12_2021',
      name: 'Mercedes-AMG W12',
      engine: 'Mercedes V6 Turbo Hybrid',
      rating_geral: 97,
      top_speed: 99,
      aerodynamics: 97,
      conducao: 96,
      reliability: 97,
      description: 'Estabilidade insuperável em curvas longas com a unidade de potência mais refinada da era híbrida.',
    },
    strategist: {
      id: 'james_vowles_2021',
      name: 'James Vowles',
      rating_geral: 94,
      calculated_risk: 92,
      pit_tactics: 95,
      reactivity: 94,
      description: '"Valtteri, it\'s James". Comunicação cirúrgica, análise lógica de ritmo sem distrações.',
    },
    engineer: {
      id: 'james_allison_2021',
      name: 'James Allison',
      rating_geral: 95,
      aerodynamics: 96,
      innovation: 95,
      weight_saving: 94,
      description: 'Diretor técnico magistral em traduzir complicadas equações físicas em conforto na pilotagem.',
    }
  },
  {
    season: 2005,
    teamId: 'renault_2005',
    teamName: 'Renault F1 Team',
    logoColor: 'from-[#FFCC00] to-[#04015E]', // Mild Seven Yellow-Blue
    borderColor: 'border-[#FFCC00]',
    textColor: 'text-[#FFCC00]',
    drivers: [
      {
        id: 'alonso_2005',
        name: 'Fernando Alonso',
        country: 'Espanha 🇪🇸',
        titles: 2,
        wins: 32,
        podiums: 106,
        poles: 22,
        rating_geral: 96,
        pace: 96,
        consistency: 98,
        chuva: 94,
        aggressiveness: 92,
        reliability: 97,
        description: 'Estilo agressivo único, reflexos animalescos e inteligência de leitura de corrida inigualável.',
      },
      {
        id: 'fisichella_2005',
        name: 'Giancarlo Fisichella',
        country: 'Itália 🇮🇹',
        titles: 0,
        wins: 3,
        podiums: 19,
        poles: 4,
        rating_geral: 85,
        pace: 84,
        consistency: 85,
        chuva: 88,
        aggressiveness: 80,
        reliability: 88,
        description: 'Vencedor experiente de corridas clássicas com excelente ginga mecânica e bom coração.',
      }
    ],
    boss: {
      id: 'flavio_briatore_2005',
      name: 'Flavio Briatore',
      country: 'Itália 🇮🇹',
      rating_geral: 90,
      leadership: 92,
      pressure_handling: 86,
      prestige: 90,
      description: 'Personagem extravagante, foca em extrair o máximo do talento de seus jovens prodígios.',
    },
    chassis: {
      id: 'r25_2005',
      name: 'Renault R25',
      engine: 'Renault RS25 V10',
      rating_geral: 94,
      top_speed: 93,
      aerodynamics: 95,
      conducao: 97,
      reliability: 95,
      description: 'Excelente distribuição dinâmica mecânica e suspensão dianteira inovadora anti-bumping.',
    },
    strategist: {
      id: 'pat_symonds_2005',
      name: 'Pat Symonds',
      rating_geral: 92,
      calculated_risk: 93,
      pit_tactics: 91,
      reactivity: 92,
      description: 'Estrategista de corridas histórico com visão em usar pneus macios no instante perfeito.',
    },
    engineer: {
      id: 'bob_bell_2005',
      name: 'Bob Bell',
      rating_geral: 90,
      aerodynamics: 90,
      innovation: 92,
      weight_saving: 89,
      description: 'Criou os amortecedores de massa (mass damper) revolucionários no meio da suspensão de 2005.',
    }
  },
  {
    season: 2009,
    teamId: 'brawn_2009',
    teamName: 'Brawn GP',
    logoColor: 'from-[#B4F000] to-white', // Neon Yellow/White
    borderColor: 'border-[#B4F000]',
    textColor: 'text-[#B4F000]',
    drivers: [
      {
        id: 'button_2009',
        name: 'Jenson Button',
        country: 'Reino Unido 🇬🇧',
        titles: 1,
        wins: 15,
        podiums: 50,
        poles: 8,
        rating_geral: 92,
        pace: 91,
        consistency: 96,
        chuva: 98,
        aggressiveness: 80,
        reliability: 96,
        description: 'Suavidade máxima no volante. Gênio de decisões cruciais para troca rápidas sob tempo incerto.',
      },
      {
        id: 'rubinho_2009',
        name: 'Rubens Barrichello',
        country: 'Brasil 🇧🇷',
        titles: 0,
        wins: 11,
        podiums: 68,
        poles: 14,
        rating_geral: 89,
        pace: 88,
        consistency: 90,
        chuva: 92,
        aggressiveness: 81,
        reliability: 91,
        description: 'Toda sua experiência moldou o acerto fino e feedback preciso da equipe de conto de fadas.',
      }
    ],
    boss: {
      id: 'ross_brawn_2009',
      name: 'Ross Brawn',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 98,
      leadership: 99,
      pressure_handling: 98,
      prestige: 99,
      description: 'Comprou a falida equipe Honda por 1 libra e construiu o conto de fadas campeão mais belo do esporte.',
    },
    chassis: {
      id: 'bgp001_2009',
      name: 'Brawn BGP 001',
      engine: 'Mercedes V8',
      rating_geral: 93,
      top_speed: 95,
      aerodynamics: 94,
      conducao: 96,
      reliability: 94,
      description: 'Contém o revolucionário e polêmico "difusor duplo", gerando pressão gravitacional enorme nas retas.',
    },
    strategist: {
      id: 'james_vowles_2009',
      name: 'James Vowles',
      rating_geral: 92,
      calculated_risk: 94,
      pit_tactics: 91,
      reactivity: 93,
      description: 'Gerenciou recursos táticos extremamente escassos na equipe independente sem nenhum erro de piloto.',
    },
    engineer: {
      id: 'jorg_zander_2009',
      name: 'Jörg Zander',
      rating_geral: 89,
      aerodynamics: 88,
      innovation: 94,
      weight_saving: 91,
      description: 'Adaptou um motor Mercedes no chassi que havia sido desenhado para a Honda em tempo recorde.',
    }
  },
  {
    season: 2012,
    teamId: 'ferrari_2012',
    teamName: 'Ferrari Class',
    logoColor: 'from-[#C2111A] to-yellow-500', // Ferrari Red dark-yellow
    borderColor: 'border-[#C2111A]',
    textColor: 'text-[#C2111A]',
    drivers: [
      {
        id: 'alonso_2012',
        name: 'Fernando Alonso',
        country: 'Espanha 🇪🇸',
        titles: 2,
        wins: 32,
        podiums: 106,
        poles: 22,
        rating_geral: 98,
        pace: 97,
        consistency: 100,
        chuva: 98,
        aggressiveness: 93,
        reliability: 98,
        description: 'Sua lendária temporada de 2012. Extraiu cada centésimo de segundo de um carro problemático com raça pura.',
      },
      {
        id: 'massa_2012',
        name: 'Felipe Massa',
        country: 'Brasil 🇧🇷',
        titles: 0,
        wins: 11,
        podiums: 41,
        poles: 16,
        rating_geral: 86,
        pace: 86,
        consistency: 85,
        chuva: 80,
        aggressiveness: 87,
        reliability: 89,
        description: 'Vencedor leal altamente aguerrido, rápido em circuitos rápidos e de grande resiliência mental.',
      }
    ],
    boss: {
      id: 'stefano_domenicali_2012',
      name: 'Stefano Domenicali',
      country: 'Itália 🇮🇹',
      rating_geral: 87,
      leadership: 88,
      pressure_handling: 85,
      prestige: 88,
      description: 'Liderança amigável e protetora dos seus pilotos, manteve-se firme na guerra tática contra Red Bull.',
    },
    chassis: {
      id: 'f2012',
      name: 'Ferrari F2012',
      engine: 'Ferrari Tipo 056 V8',
      rating_geral: 88,
      top_speed: 92,
      aerodynamics: 85,
      conducao: 89,
      reliability: 99,
      description: 'Aerodinamicamente fraco nas primeiras corridas, mas extremamente confiável e sólido na chuva.',
    },
    strategist: {
      id: 'pat_fry_2012',
      name: 'Pat Fry',
      rating_geral: 89,
      calculated_risk: 88,
      pit_tactics: 90,
      reactivity: 89,
      description: 'Estratégia sólida com foco em compensar as fraquezas de velocidade do qualy de sábado nas largadas de domingo.',
    },
    engineer: {
      id: 'nikolas_tombazis_2012',
      name: 'Nikolas Tombazis',
      rating_geral: 86,
      aerodynamics: 85,
      innovation: 87,
      weight_saving: 88,
      description: 'Abordagem focada em extrair ar da asa dianteira bico "feioso" em degrau para gerar aderência mecânica.',
    }
  },
  {
    season: 2020,
    teamId: 'ferrari_2020_meme',
    teamName: 'Ferrari (Crise 2020)',
    logoColor: 'from-[#5A0A10] to-[#FFCC00]', // Dark burgundy (crises)
    borderColor: 'border-[#5a0a10]',
    textColor: 'text-[#5a0a10]',
    drivers: [
      {
        id: 'leclerc_2020',
        name: 'Charles Leclerc',
        country: 'Mônaco 🇲🇨',
        titles: 0,
        wins: 7,
        podiums: 38,
        poles: 26,
        rating_geral: 91,
        pace: 93,
        consistency: 88,
        chuva: 85,
        aggressiveness: 91,
        reliability: 84,
        description: 'Tocou o terror nas pistas tentando superar canhestramente os severos limites de velocidade do carro.',
      },
      {
        id: 'vettel_2020',
        name: 'Sebastian Vettel',
        country: 'Alemanha 🇩🇪',
        titles: 4,
        wins: 53,
        podiums: 122,
        poles: 57,
        rating_geral: 86,
        pace: 84,
        consistency: 83,
        chuva: 88,
        aggressiveness: 84,
        reliability: 84,
        description: 'Quatro vezes campeão mundial, mas passando pelo desgaste psicológico terrível da sua saída italiana.',
      }
    ],
    boss: {
      id: 'mattia_binotto_2020',
      name: 'Mattia Binotto',
      country: 'Suíça 🇨🇭 / Itália',
      rating_geral: 72,
      leadership: 68,
      pressure_handling: 65,
      prestige: 75,
      description: 'Líder com postura dócil, mas que sofreu enorme pressão estratégica e política sob os motores limitados.',
    },
    chassis: {
      id: 'sf1000_2020',
      name: 'Ferrari SF1000',
      engine: 'Ferrari V6 restrito por acordo secreto',
      rating_geral: 75,
      top_speed: 70, // Extremely slow in straight lines
      aerodynamics: 78,
      conducao: 74,
      reliability: 82,
      description: 'O terrível carro do acordo secreto de fluxo de combustível. Apelidado de trator de arrasto nas retas.',
    },
    strategist: {
      id: 'inaki_rueda_2020',
      name: 'Inaki Rueda (Meme)',
      rating_geral: 65,
      calculated_risk: 60,
      pit_tactics: 68,
      reactivity: 55,
      description: 'Lendário no mundo da zoeira. Chamadas confusas que resultaram em pitstops bizarros e pneus errados.',
    },
    engineer: {
      id: 'enrico_cardile_2020',
      name: 'Enrico Cardile',
      rating_geral: 80,
      aerodynamics: 81,
      innovation: 75,
      weight_saving: 81,
      description: 'Trabalho pesado com asas traseiras gigantescas para tentar segurar a rabeada crônica aerodinâmica.',
    }
  },
  {
    season: 2007,
    teamId: 'mclaren_2007',
    teamName: 'McLaren-Mercedes',
    logoColor: 'from-[#C0C0C0] to-[#E51B24]',
    borderColor: 'border-[#C0C0C0]',
    textColor: 'text-[#C0C0C0]',
    drivers: [
      {
        id: 'alonso_2007',
        name: 'Fernando Alonso',
        country: 'Espanha 🇪🇸',
        titles: 2,
        wins: 32,
        podiums: 106,
        poles: 22,
        rating_geral: 97,
        pace: 98,
        consistency: 96,
        chuva: 95,
        aggressiveness: 94,
        reliability: 97,
        description: 'Bicampeão vindo defender o título. Garra inabalável e estilo intimidadora de disputar espaços na curva 1.',
      },
      {
        id: 'hamilton_2007',
        name: 'Lewis Hamilton',
        country: 'Reino Unido 🇬🇧',
        titles: 0,
        wins: 105,
        podiums: 201,
        poles: 104,
        rating_geral: 96,
        pace: 97,
        consistency: 93,
        chuva: 98,
        aggressiveness: 95,
        reliability: 94,
        description: 'Temporada de estreia avassaladora do jovem prodígio fustigando o atual campeão desde a primeira corrida.',
      }
    ],
    boss: {
      id: 'ron_dennis_2007',
      name: 'Ron Dennis',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 95,
      leadership: 96,
      pressure_handling: 85,
      prestige: 97,
      description: 'Chefe rigoroso que administrou (com extrema tensão) uma das maiores e mais tensas rivalidades internas da F1.',
    },
    chassis: {
      id: 'mp4_22_2007',
      name: 'McLaren MP4-22',
      engine: 'Mercedes-Benz FO 108T V8',
      rating_geral: 97,
      top_speed: 98,
      aerodynamics: 97,
      conducao: 96,
      reliability: 94,
      description: 'Um chassi cromado brilhante e veloz. Travou combates espetaculares na pista com a rival Ferrari.',
    },
    strategist: {
      id: 'chris_dyer_2007',
      name: 'Chris Dyer',
      rating_geral: 91,
      calculated_risk: 90,
      pit_tactics: 92,
      reactivity: 91,
      description: 'Estrategista refinado em gerenciar paradas críticas sob alto tráfego.',
    },
    engineer: {
      id: 'paddy_lowe_2007',
      name: 'Paddy Lowe',
      rating_geral: 93,
      aerodynamics: 94,
      innovation: 92,
      weight_saving: 93,
      description: 'Chefe de engenharia focado em rigidez torsional extrema e integração mecânica de ponta com o motor V8.',
    }
  },
  {
    season: 1978,
    teamId: 'lotus_1978',
    teamName: 'Team Lotus',
    logoColor: 'from-[#111111] to-[#CFB53B]',
    borderColor: 'border-[#CFB53B]',
    textColor: 'text-[#CFB53B]',
    drivers: [
      {
        id: 'andretti_1978',
        name: 'Mario Andretti',
        country: 'EUA 🇺🇸',
        titles: 1,
        wins: 12,
        podiums: 19,
        poles: 18,
        rating_geral: 94,
        pace: 94,
        consistency: 93,
        chuva: 85,
        aggressiveness: 90,
        reliability: 91,
        description: 'Frieza americana versátil. O homem que dominou a revolução do efeito solo na era clássica da F1.',
      },
      {
        id: 'peterson_1978',
        name: 'Ronnie Peterson',
        country: 'Suécia 🇸🇪',
        titles: 0,
        wins: 10,
        podiums: 26,
        poles: 14,
        rating_geral: 93,
        pace: 96,
        consistency: 88,
        chuva: 94,
        aggressiveness: 96,
        reliability: 88,
        description: 'O sueco voador. Estilo de pilotagem agressivo e icônica pilotagem de lado nas curvas rápidas de efeito solo.',
      }
    ],
    boss: {
      id: 'colin_chapman_1978',
      name: 'Colin Chapman',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 99,
      leadership: 95,
      pressure_handling: 90,
      prestige: 99,
      description: 'Gênio visionário. Fundador da Lotus e inventor de quase todas as principais inovações técnicas da história do esporte.',
    },
    chassis: {
      id: 'lotus_79_1978',
      name: 'Lotus Type 79',
      engine: 'Ford Cosworth DFV V8',
      rating_geral: 98,
      top_speed: 94,
      aerodynamics: 100,
      conducao: 97,
      reliability: 86,
      description: 'O lendário "carro asa" preto e dourado. Introduziu com maestria o vácuo de efeito solo sob as saias laterais.',
    },
    strategist: {
      id: 'peter_warr_1978',
      name: 'Peter Warr',
      rating_geral: 90,
      calculated_risk: 92,
      pit_tactics: 89,
      reactivity: 90,
      description: 'Braço direito clássico de Chapman, mestre em analisar lacunas e tempo líquido de corrida.',
    },
    engineer: {
      id: 'martin_ogilvie_1978',
      name: 'Martin Ogilvie',
      rating_geral: 94,
      aerodynamics: 98,
      innovation: 96,
      weight_saving: 92,
      description: 'Projetista genial no desenvolvimento mecânico do bocal das asas invertidas integradas nas laterais.',
    }
  },
  {
    season: 2012,
    teamId: 'redbull_2012',
    teamName: 'Red Bull Racing (Era Vettel)',
    logoColor: 'from-[#001D4A] to-[#F1B814]',
    borderColor: 'border-[#F1B814]',
    textColor: 'text-[#F1B814]',
    drivers: [
      {
        id: 'vettel_2012',
        name: 'Sebastian Vettel',
        country: 'Alemanha 🇩🇪',
        titles: 4,
        wins: 53,
        podiums: 122,
        poles: 57,
        rating_geral: 97,
        pace: 98,
        consistency: 96,
        chuva: 92,
        aggressiveness: 91,
        reliability: 96,
        description: 'Venceu o incrível campeonato de 2012 liderando recuperações sensacionais com frieza milimétrica.',
      },
      {
        id: 'webber_2012',
        name: 'Mark Webber',
        country: 'Austrália 🇦🇺',
        titles: 0,
        wins: 9,
        podiums: 42,
        poles: 13,
        rating_geral: 88,
        pace: 90,
        consistency: 87,
        chuva: 82,
        aggressiveness: 89,
        reliability: 89,
        description: 'Australiano durão que travou batalhas ferozes internas e impôs enorme esforço em circuitos rápidos.',
      }
    ],
    boss: {
      id: 'christian_horner_2012',
      name: 'Christian Horner',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 92,
      leadership: 94,
      pressure_handling: 90,
      prestige: 92,
      description: 'Liderou a equipe na era dourada dos títulos consecutivos mantendo a harmonia entre o pit lane.',
    },
    chassis: {
      id: 'rb8_2012',
      name: 'Red Bull RB8',
      engine: 'Renault RS27-2012 V8',
      rating_geral: 96,
      top_speed: 94,
      aerodynamics: 98,
      conducao: 96,
      reliability: 94,
      description: 'Projetado com o inovador mapeamento do difusor soprado que colava a traseira do bólido nas curvas.',
    },
    strategist: {
      id: 'guillaume_rocquelin_2012',
      name: 'Guillaume Rocquelin',
      rating_geral: 93,
      calculated_risk: 91,
      pit_tactics: 94,
      reactivity: 92,
      description: 'Engenheiro de mureta clássico ("Rocky") com comunicação pragmática de rádio direto com Vettel.',
    },
    engineer: {
      id: 'adrian_newey_2012',
      name: 'Adrian Newey',
      rating_geral: 99,
      aerodynamics: 100,
      innovation: 99,
      weight_saving: 97,
      description: 'Gênio indiscutível de layout de fluxo de ar. Garantiu a reviravolta tática das escapadas traseiras da Red Bull.',
    }
  },
  {
    season: 2021,
    teamId: 'haas_2021',
    teamName: 'Haas F1 Team',
    logoColor: 'from-[#FFFFFF] to-[#E6002B]',
    borderColor: 'border-[#E6002B]',
    textColor: 'text-white',
    isWorst: true,
    drivers: [
      {
        id: 'schumacher_2021',
        name: 'Mick Schumacher',
        country: 'Alemanha 🇩🇪',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 72,
        pace: 71,
        consistency: 73,
        chuva: 74,
        aggressiveness: 80,
        reliability: 75,
        description: 'Sofreu em um chassi obsoleto que não recebeu nenhuma atualização durante todo o ano de 2021.',
      },
      {
        id: 'mazepin_2021',
        name: 'Nikita Mazepin',
        country: 'Rússia 🇷🇺',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 58,
        pace: 55,
        consistency: 50,
        chuva: 60,
        aggressiveness: 82,
        reliability: 55,
        description: 'Frequentador assíduo das últimas colocações, marcado por rodadas constantes ("Maze-spin") e polêmicas.',
      }
    ],
    boss: {
      id: 'guenther_steiner_2021',
      name: 'Guenther Steiner',
      country: 'Itália 🇮🇹',
      rating_geral: 70,
      leadership: 74,
      pressure_handling: 65,
      prestige: 72,
      description: 'Estrela do Drive to Survive, mas gerindo um orçamento minúsculo com um carro impossível de guiar.',
    },
    chassis: {
      id: 'vf_21_2021',
      name: 'Haas VF-21',
      engine: 'Ferrari 065/6 V6 Turbo',
      rating_geral: 62,
      top_speed: 64,
      aerodynamics: 60,
      conducao: 58,
      reliability: 70,
      description: 'Essencialmente o carro de 2020 pintado de branco, lento, instável e impróprio para duelos com o pelotão médio.',
    },
    strategist: {
      id: 'haas_strat_2021',
      name: 'Ayao Komatsu (2021)',
      rating_geral: 66,
      calculated_risk: 68,
      pit_tactics: 65,
      reactivity: 65,
      description: 'Tinha que improvisar estratégias alternativas de pneus para tentar não fechar as corridas em último.',
    },
    engineer: {
      id: 'haas_eng_2021',
      name: 'Simone Resta',
      rating_geral: 69,
      aerodynamics: 68,
      innovation: 65,
      weight_saving: 67,
      description: 'Engenheiro emprestado da Ferrari focado já em projetar a máquina de 2022, deixando o carro atual obsoleto.',
    }
  },
  {
    season: 1992,
    teamId: 'andrea_moda_1992',
    teamName: 'Andrea Moda Formula',
    logoColor: 'from-[#000000] to-[#ECCE14]',
    borderColor: 'border-[#ECCE14]',
    textColor: 'text-[#ECCE14]',
    isWorst: true,
    drivers: [
      {
        id: 'moreno_1992',
        name: 'Roberto Moreno',
        country: 'Brasil 🇧🇷',
        titles: 0,
        wins: 0,
        podiums: 1,
        poles: 0,
        rating_geral: 64,
        pace: 66,
        consistency: 60,
        chuva: 75,
        aggressiveness: 70,
        reliability: 58,
        description: 'Veterano herói brasileiro que operou um milagre ao pré-qualificar este calhambeque em Mônaco.',
      },
      {
        id: 'mccarthy_1992',
        name: 'Perry McCarthy (Stig)',
        country: 'Reino Unido 🇬🇧',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 50,
        pace: 52,
        consistency: 45,
        chuva: 55,
        aggressiveness: 72,
        reliability: 40,
        description: 'Boicotado pela própria equipe com peças usadas e chassi quebrado. Ficou conhecido depois por ser o "The Stig".',
      }
    ],
    boss: {
      id: 'andrea_sassetti_1992',
      name: 'Andrea Sassetti',
      country: 'Itália 🇮🇹',
      rating_geral: 45,
      leadership: 40,
      pressure_handling: 42,
      prestige: 30,
      description: 'Magnata dos sapatos que administrou a equipe mais indisciplinada, bizarra e banida de toda a história da F1.',
    },
    chassis: {
      id: 'moda_s921_1992',
      name: 'Andrea Moda S921',
      engine: 'Judd GV V10',
      rating_geral: 42,
      top_speed: 48,
      aerodynamics: 40,
      conducao: 38,
      reliability: 41,
      description: 'Um chassi herdado da falida Coloni, que mal conseguia dar duas voltas completas sem que as peças voassem pelos ares.',
    },
    strategist: {
      id: 'sassetti_strat_1992',
      name: 'Pitline Caótico',
      rating_geral: 40,
      calculated_risk: 50,
      pit_tactics: 35,
      reactivity: 38,
      description: 'Fretamento de pneus atrasado, mecânicos largados em aeroportos e ausência de qualquer planejamento líquido.',
    },
    engineer: {
      id: 'simtek_s921_eng',
      name: 'Nick Wirth',
      rating_geral: 60,
      aerodynamics: 58,
      innovation: 65,
      weight_saving: 55,
      description: 'Projetou um chassi rápido no papel, sabotado pela falta crônica de fundos e manufatura de péssimo nível.',
    }
  },
  {
    season: 2019,
    teamId: 'williams_2019',
    teamName: 'Williams Racing',
    logoColor: 'from-[#FFFFFF] to-[#20A1D6]',
    borderColor: 'border-[#20A1D6]',
    textColor: 'text-white',
    isWorst: true,
    drivers: [
      {
        id: 'russell_2019',
        name: 'George Russell',
        country: 'Reino Unido 🇬🇧',
        titles: 0,
        wins: 2,
        podiums: 14,
        poles: 3,
        rating_geral: 78,
        pace: 80,
        consistency: 79,
        chuva: 75,
        aggressiveness: 80,
        reliability: 82,
        description: 'Calouro brilhante que superou o companheiro de equipe em absolutamente todos os treinos oficiais.',
      },
      {
        id: 'kubica_2019',
        name: 'Robert Kubica',
        country: 'Polônia 🇵🇱',
        titles: 0,
        wins: 1,
        podiums: 12,
        poles: 1,
        rating_geral: 70,
        pace: 68,
        consistency: 73,
        chuva: 74,
        aggressiveness: 72,
        reliability: 80,
        description: 'Retorno heroico ao grid após terrível acidente de rali. Marcou o único ponto da equipe na chuva ranzinza.',
      }
    ],
    boss: {
      id: 'claire_williams_2019',
      name: 'Claire Williams',
      country: 'Reino Unido 🇬🇧',
      rating_geral: 65,
      leadership: 68,
      pressure_handling: 60,
      prestige: 75,
      description: 'Herdeira da equipe lutando arduamente contra a desorganização interna e a falta drástica de patrocínio.',
    },
    chassis: {
      id: 'fw42_2019',
      name: 'Williams FW42',
      engine: 'Mercedes-AMG M10 V6 Turbo',
      rating_geral: 66,
      top_speed: 73,
      aerodynamics: 62,
      conducao: 63,
      reliability: 81,
      description: 'Atrasou as sessões de testes coletivos em Barcelona. Era visivelmente mais lento do que toda a concorrência.',
    },
    strategist: {
      id: 'williams_strat_2019',
      name: 'James Vowles (Suporte)',
      rating_geral: 74,
      calculated_risk: 70,
      pit_tactics: 75,
      reactivity: 72,
      description: 'Estratégia tradicional mas presa à triste realidade de um carro que tomava 2 segundos por volta.',
    },
    engineer: {
      id: 'paddy_lowe_2019',
      name: 'Paddy Lowe (Saída)',
      rating_geral: 68,
      aerodynamics: 65,
      innovation: 64,
      weight_saving: 70,
      description: 'Deixou a escuderia antes da primeira corrida após o fiasco do carro não ficar pronto a tempo para a pista.',
    }
  },
  {
    season: 2001,
    teamId: 'minardi_2001',
    teamName: 'Minardi F1 Team',
    logoColor: 'from-[#111111] to-[#FFF000]',
    borderColor: 'border-[#FFF000]',
    textColor: 'text-white',
    isWorst: true,
    drivers: [
      {
        id: 'alonso_2001',
        name: 'Fernando Alonso (Rookie)',
        country: 'Espanha 🇪🇸',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 81,
        pace: 83,
        consistency: 80,
        chuva: 82,
        aggressiveness: 84,
        reliability: 76,
        description: 'Mostrou seu talento colossal extraindo milagres de um motor defasado de dois anos de idade.',
      },
      {
        id: 'marques_2001',
        name: 'Tarso Marques',
        country: 'Brasil 🇧🇷',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 65,
        pace: 64,
        consistency: 66,
        chuva: 72,
        aggressiveness: 70,
        reliability: 70,
        description: 'Piloto brasileiro que teve bons resultados de corrida sob chuva mas faltou-lhe equipamento decente.',
      }
    ],
    boss: {
      id: 'paul_stoddart_2001',
      name: 'Paul Stoddart',
      country: 'Austrália 🇦🇺',
      rating_geral: 72,
      leadership: 75,
      pressure_handling: 78,
      prestige: 70,
      description: 'Magnata da aviação carismático que salvou a querida Minardi da falência semanas antes do primeiro GP.',
    },
    chassis: {
      id: 'ps01_2001',
      name: 'Minardi PS01',
      engine: 'European (Ford Cosworth) V10',
      rating_geral: 68,
      top_speed: 70,
      aerodynamics: 67,
      conducao: 68,
      reliability: 72,
      description: 'Leve e aerodinamicamente decente, mas prejudicado por um motor antiquado e sem potência de reta.',
    },
    strategist: {
      id: 'minardi_strat_2001',
      name: 'Mureta de Faenza',
      rating_geral: 69,
      calculated_risk: 74,
      pit_tactics: 70,
      reactivity: 72,
      description: 'Famosos por arriscar pit stops bem curtos ou táticas de chuva malucas para roubar posições.',
    },
    engineer: {
      id: 'gabriele_tredozi_2001',
      name: 'Gabriele Tredozi',
      rating_geral: 70,
      aerodynamics: 69,
      innovation: 71,
      weight_saving: 72,
      description: 'Focado em espremer o pouco orçamento para manufaturar peças de reposição resistentes em fibra de carbono.',
    }
  },
  {
    season: 2011,
    teamId: 'hrt_2011',
    teamName: 'HRT Formula 1 Team',
    logoColor: 'from-[#FFFFFF] to-[#800080]',
    borderColor: 'border-[#800080]',
    textColor: 'text-white',
    isWorst: true,
    drivers: [
      {
        id: 'liuzzi_2011',
        name: 'Vitantonio Liuzzi',
        country: 'Itália 🇮🇹',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 68,
        pace: 68,
        consistency: 67,
        chuva: 72,
        aggressiveness: 75,
        reliability: 72,
        description: 'Ex-piloto Red Bull experiente que fez tudo ao alcance para empurrar o monoplaza cinza.',
      },
      {
        id: 'karthikeyan_2011',
        name: 'Narain Karthikeyan',
        country: 'Índia 🇮🇳',
        titles: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        rating_geral: 62,
        pace: 61,
        consistency: 64,
        chuva: 66,
        aggressiveness: 65,
        reliability: 68,
        description: 'Primeiro piloto indiano da F1. Teve dificuldades constantes de aderência com pneus de composto duro.',
      }
    ],
    boss: {
      id: 'colin_kolles_2011',
      name: 'Colin Kolles',
      country: 'Romênia 🇷🇴',
      rating_geral: 64,
      leadership: 68,
      pressure_handling: 65,
      prestige: 60,
      description: 'Administrador de mureta durão. Conhecido por colocar pilotos que traziam pacotes generosos de patrocínio.',
    },
    chassis: {
      id: 'f111_2011',
      name: 'HRT F111',
      engine: 'Cosworth CA2011 V8',
      rating_geral: 63,
      top_speed: 68,
      aerodynamics: 60,
      conducao: 61,
      reliability: 70,
      description: 'Construído sem túnel de vento real e completado minutos antes do GP inaugural direto nos boxes frios.',
    },
    strategist: {
      id: 'hrt_strat_2011',
      name: 'Estratégia de Sobrevivência',
      rating_geral: 62,
      calculated_risk: 65,
      pit_tactics: 62,
      reactivity: 64,
      description: 'Pautada unicamente em cruzar a linha de chegada desviando de acidentes e retardatários.',
    },
    engineer: {
      id: 'geoff_willis_hrt',
      name: 'Geoff Willis',
      rating_geral: 72,
      aerodynamics: 70,
      innovation: 66,
      weight_saving: 68,
      description: 'Diretor técnico renomado contratado para tentar corrigir as falhas berrantes de arrasto aerodinâmico.',
    }
  }
];

// Interface for historical driver stats
interface StatsDriverRaw {
  year: number;
  name: string;
  code: string;
  teamName: string;
  races: number;
  wins: number;
  podiums: number;
  points: number;
  pos: string;
  rating_geral: number;
  rank: string;
}

interface TeammateData {
  name: string;
  country: string;
  titles: number;
  wins: number;
  podiums: number;
  poles: number;
  rating_offset?: number;
  description: string;
}

const getDriverRealCountryAndFlag = (name: string): string => {
  const norm = name.toLowerCase();
  if (norm.includes('senna')) return 'Brasil 🇧🇷';
  if (norm.includes('schumacher')) return 'Alemanha 🇩🇪';
  if (norm.includes('hamilton')) return 'Reino Unido 🇬🇧';
  if (norm.includes('verstappen')) return 'Holanda 🇳🇱';
  if (norm.includes('vettel')) return 'Alemanha 🇩🇪';
  if (norm.includes('alonso')) return 'Espanha 🇪🇸';
  if (norm.includes('prost')) return 'França 🇫🇷';
  if (norm.includes('räikkönen') || norm.includes('raikkonen')) return 'Finlândia 🇫🇮';
  if (norm.includes('rosberg')) return 'Alemanha 🇩🇪';
  if (norm.includes('piquet')) return 'Brasil 🇧🇷';
  if (norm.includes('fittipaldi')) return 'Brasil 🇧🇷';
  if (norm.includes('barrichello')) return 'Brasil 🇧🇷';
  if (norm.includes('massa')) return 'Brasil 🇧🇷';
  if (norm.includes('bortoleto')) return 'Brasil 🇧🇷';
  if (norm.includes('piastri')) return 'Austrália 🇦🇺';
  if (norm.includes('lauda')) return 'Áustria 🇦🇹';
  if (norm.includes('button')) return 'Reino Unido 🇬🇧';
  if (norm.includes('häkkinen') || norm.includes('hakkinen')) return 'Finlândia 🇫🇮';
  if (norm.includes('damon hill')) return 'Reino Unido 🇬🇧';
  if (norm.includes('villeneuve')) return 'Canadá 🇨🇦';
  if (norm.includes('mansell')) return 'Reino Unido 🇬🇧';
  if (norm.includes('alan jones')) return 'Austrália 🇦🇺';
  if (norm.includes('keke rosberg')) return 'Finlândia 🇫🇮';
  if (norm.includes('scheckter')) return 'África do Sul 🇿🇦';
  if (norm.includes('andretti')) return 'Estados Unidos 🇺🇸';
  if (norm.includes('james hunt')) return 'Reino Unido 🇬🇧';
  if (norm.includes('jackie stewart')) return 'Reino Unido 🇬🇧';
  if (norm.includes('rindt')) return 'Áustria 🇦🇹';
  if (norm.includes('brabham')) return 'Austrália 🇦🇺';
  if (norm.includes('hulme')) return 'Nova Zelândia 🇳🇿';
  if (norm.includes('graham hill')) return 'Reino Unido 🇬🇧';
  if (norm.includes('surtees')) return 'Reino Unido 🇬🇧';
  if (norm.includes('phil hill')) return 'Estados Unidos 🇺🇸';
  if (norm.includes('fangio')) return 'Argentina 🇦🇷';
  if (norm.includes('farina')) return 'Itália 🇮🇹';
  if (norm.includes('fagioli')) return 'Itália 🇮🇹';
  if (norm.includes('ascari')) return 'Itália 🇮🇹';
  return 'Mundo 🌐';
};

const REAL_TEAMMATES_DB: Record<string, TeammateData[]> = {
  "1961_ferrari": [
    { name: "Wolfgang von Trips", country: "Alemanha 🇩🇪", titles: 0, wins: 2, podiums: 6, poles: 1, rating_offset: -2, description: "Liderava o campeonato de 1961 até sofrer um trágico acidente fatal em Monza." },
    { name: "Richie Ginther", country: "Estados Unidos 🇺🇸", titles: 0, wins: 1, podiums: 14, poles: 0, rating_offset: -5, description: "Piloto extremamente técnico e engenheiro de testes excepcional da Scuderia." },
    { name: "Giancarlo Baghetti", country: "Itália 🇮🇹", titles: 0, wins: 1, podiums: 1, poles: 0, rating_offset: -8, description: "Único piloto da história a vencer sua corrida de estreia na Fórmula 1 moderna." }
  ],
  "1962_brm": [
    { name: "Richie Ginther", country: "Estados Unidos 🇺🇸", titles: 0, wins: 1, podiums: 14, poles: 0, rating_offset: -3, description: "Parceiro consistente de Graham Hill na marcante conquista do título de construtores." },
    { name: "Tony Brooks", country: "Reino Unido 🇬🇧", titles: 0, wins: 6, podiums: 10, poles: 3, rating_offset: -4, description: "O 'Dentista Voador'. Um dos pilotos mais rápidos e elegantes dos anos 50 e 60." }
  ],
  "1963_lotus_climax": [
    { name: "Trevor Taylor", country: "Reino Unido 🇬🇧", titles: 0, wins: 0, podiums: 1, poles: 0, rating_offset: -8, description: "Piloto britânico titular da Lotus ao lado de Jim Clark na lendária fase monocoque." },
    { name: "Peter Arundell", country: "Reino Unido 🇬🇧", titles: 0, wins: 0, podiums: 2, poles: 0, rating_offset: -6, description: "Piloto oficial e um dos queridinhos do projetista Colin Chapman na Lotus." }
  ],
  "1964_ferrari": [
    { name: "Lorenzo Bandini", country: "Itália 🇮🇹", titles: 0, wins: 1, podiums: 8, poles: 1, rating_offset: -4, description: "Herói italiano da Scuderia, taticamente crucial para o título de Surtees em 1964." },
    { name: "Ludovico Scarfiotti", country: "Itália 🇮🇹", titles: 0, wins: 1, podiums: 1, poles: 0, rating_offset: -7, description: "Especialista em subidas de montanha e vencedor do GP da Itália de 1966 com a Ferrari." }
  ],
  "1965_lotus_climax": [
    { name: "Mike Spence", country: "Reino Unido 🇬🇧", titles: 0, wins: 0, podiums: 1, poles: 0, rating_offset: -5, description: "Um escudeiro extremamente veloz e confiável de Jim Clark." },
    { name: "Gerhard Mitter", country: "Alemanha 🇩🇪", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -9, description: "Piloto alemão de suporte para as provas europeias da Lotus." }
  ],
  "1966_brabham_repco": [
    { name: "Denny Hulme", country: "Nova Zelândia 🇳🇿", titles: 1, wins: 8, podiums: 33, poles: 1, rating_offset: -2, description: "O 'Urso'. Conquistou ótimos pódios ao lado do chefe Jack Brabham em 1966." }
  ],
  "1967_brabham_repco": [
    { name: "Jack Brabham", country: "Austrália 🇦🇺", titles: 3, wins: 14, podiums: 31, poles: 13, rating_offset: -1, description: "O próprio chefe de equipe correndo agressivamente contra seu pupilo Denny Hulme." }
  ],
  "1968_lotus_ford": [
    { name: "Jochen Rindt", country: "Áustria 🇦🇹", titles: 1, wins: 6, podiums: 13, poles: 10, rating_offset: -1, description: "Piloto extremamente agressivo, futuramente o único campeão póstumo da F1." },
    { name: "Jackie Oliver", country: "Reino Unido 🇬🇧", titles: 0, wins: 0, podiums: 4, poles: 0, rating_offset: -6, description: "Substituiu Jim Clark após a tragédia de Hockenheim, garantindo pódios valiosos." }
  ],
  "1969_matra_ford": [
    { name: "Jean-Pierre Beltoise", country: "França 🇫🇷", titles: 0, wins: 1, podiums: 8, poles: 0, rating_offset: -5, description: "Piloto francês combativo, grande parceiro de mureta de Jackie Stewart." }
  ],
  "1970_team_lotus": [
    { name: "Emerson Fittipaldi", country: "Brasil 🇧🇷", titles: 2, wins: 14, podiums: 35, poles: 6, rating_offset: -3, description: "O jovem promissor brasileiro que venceu em Watkins Glen garantindo o título póstumo de Rindt." },
    { name: "John Miles", country: "Reino Unido 🇬🇧", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -8, description: "Um dos pilotos de testes e desenvolvimento originais do lendário chassi Lotus 72." }
  ],
  "1971_tyrrell": [
    { name: "François Cevert", country: "França 🇫🇷", titles: 0, wins: 1, podiums: 13, poles: 0, rating_offset: -3, description: "Carismático e talentoso herdeiro técnico de Jackie Stewart na Tyrrell." }
  ],
  "1972_team_lotus": [
    { name: "Dave Walker", country: "Austrália 🇦🇺", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -9, description: "Piloto australiano titular que completou a temporada histórica ao lado do campeão Fittipaldi." },
    { name: "Reine Wisell", country: "Suécia 🇸🇪", titles: 0, wins: 0, podiums: 1, poles: 0, rating_offset: -7, description: "Piloto sueco que correu como substituto na icônica equipe preta e dourada da JPS." }
  ],
  "1973_tyrrell": [
    { name: "François Cevert", country: "França 🇫🇷", titles: 0, wins: 1, podiums: 13, poles: 0, rating_offset: -2, description: "Protegido de Stewart que infelizmente faleceu de forma trágica no GP dos EUA de 1973." },
    { name: "Chris Amon", country: "Nova Zelândia 🇳🇿", titles: 0, wins: 0, podiums: 11, poles: 5, rating_offset: -4, description: "Considerado um dos melhores pilotos a nunca vencer um GP devido ao seu eterno azar." }
  ],
  "1974_mclaren": [
    { name: "Denny Hulme", country: "Nova Zelândia 🇳🇿", titles: 1, wins: 8, podiums: 33, poles: 1, rating_offset: -3, description: "Camarada campeão experiente de Fittipaldi, que venceu o GP da Argentina de 1974." },
    { name: "Mike Hailwood", country: "Reino Unido 🇬🇧", titles: 0, wins: 0, podiums: 2, poles: 0, rating_offset: -5, description: "Lenda lendária das motocicletas, muito respeitado por sua bravura nas quatro rodas." }
  ],
  "1975_ferrari": [
    { name: "Clay Regazzoni", country: "Suíça 🇨🇭", titles: 0, wins: 5, podiums: 28, poles: 5, rating_offset: -3, description: "O implacável bigodudo suíço, vencedor do GP da Itália de 1975." }
  ],
  "1976_mclaren": [
    { name: "Jochen Mass", country: "Alemanha 🇩🇪", titles: 0, wins: 1, podiums: 8, poles: 0, rating_offset: -4, description: "Parceiro ideal de James Hunt, garantindo o título de construtores de forma sólida." }
  ],
  "1977_ferrari": [
    { name: "Carlos Reutemann", country: "Argentina 🇦🇷", titles: 0, wins: 12, podiums: 45, poles: 6, rating_offset: -3, description: "O 'Lole'. Piloto argentino extremamente técnico e veloz, porém sensível a pressões." },
    { name: "Gilles Villeneuve", country: "Canadá 🇨🇦", titles: 0, wins: 6, podiums: 13, poles: 2, rating_offset: -5, description: "O lendário canadense que estreou pela Ferrari no final da temporada de 1977." }
  ],
  "1978_lotus_ford": [
    { name: "Ronnie Peterson", country: "Suécia 🇸🇪", titles: 0, wins: 10, podiums: 26, poles: 14, rating_offset: -1, description: "O 'Sueco Voador'. Pilotagem espetacular por derrapagem controlada. Vice-campeão póstumo." },
    { name: "Jean-Pierre Jarier", country: "França 🇫🇷", titles: 0, wins: 0, podiums: 3, poles: 3, rating_offset: -6, description: "Veloz piloto francês contratado para substituir Peterson na reta final de 1978." }
  ],
  "1979_ferrari": [
    { name: "Gilles Villeneuve", country: "Canadá 🇨🇦", titles: 0, wins: 6, podiums: 13, poles: 2, rating_offset: -1, description: "A velocidade pura personificada. Deixou o título daquele ano para o parceiro Jody Scheckter." }
  ],
  "1980_williams_ford": [
    { name: "Carlos Reutemann", country: "Argentina 🇦🇷", titles: 0, wins: 12, podiums: 45, poles: 6, rating_offset: -2, description: "Parceiro ultraveloz de Alan Jones, garantindo o título de construtores da equipe Williams." }
  ],
  "1981_brabham_ford": [
    { name: "Hector Rebaque", country: "México 🇲🇽", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -8, description: "Piloto mexicano responsável por pontuar ao lado de Nelson Piquet na Brabham" },
    { name: "Ricardo Zunino", country: "Argentina 🇦🇷", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -10, description: "Piloto argentino acionado de última hora para disputar GPs pela equipe de Ecclestone." }
  ],
  "1982_williams_ford": [
    { name: "Derek Daly", country: "Irlanda 🇮🇪", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -6, description: "Piloto titular irlandês polivalente que acompanhou Keke Rosberg no ano do título." },
    { name: "Carlos Reutemann", country: "Argentina 🇦🇷", titles: 0, wins: 12, podiums: 45, poles: 6, rating_offset: -3, description: "Disputou as primeiras corridas de 1982 pela Williams antes de se aposentar precocemente." }
  ],
  "1983_brabham_bmw": [
    { name: "Riccardo Patrese", country: "Itália 🇮🇹", titles: 0, wins: 6, podiums: 37, poles: 8, rating_offset: -3, description: "Guerreiro experiente italiano que ajudou a Brabham na feroz disputa mecânica de 1983." }
  ],
  "1984_mclaren": [
    { name: "Alain Prost", country: "França 🇫🇷", titles: 4, wins: 51, podiums: 106, poles: 33, rating_offset: 1, description: "O Professor. Perdeu o título de 1984 para Niki Lauda por apenas 0,5 ponto!" }
  ],
  "1985_mclaren_porsche": [
    { name: "Niki Lauda", country: "Áustria 🇦🇹", titles: 3, wins: 25, podiums: 54, poles: 24, rating_offset: -2, description: "O lendário tricampeão disputando sua última temporada de Fórmula 1 antes de se aposentar definitivo." },
    { name: "John Watson", country: "Reino Unido 🇬🇧", titles: 0, wins: 5, podiums: 20, poles: 2, rating_offset: -5, description: "Acionado para substituir Lauda no GP da Europa de 1985 em Brands Hatch." }
  ],
  "1986_mclaren_porsche": [
    { name: "Keke Rosberg", country: "Finlândia 🇫🇮", titles: 1, wins: 5, podiums: 17, poles: 5, rating_offset: -3, description: "Lenda finlandesa corajosa que se juntou à McLaren no final de sua grande carreira." }
  ],
  "1987_williams_honda": [
    { name: "Nigel Mansell", country: "Reino Unido 🇬🇧", titles: 1, wins: 31, podiums: 59, poles: 32, rating_offset: 0, description: "O 'Leão'. Companheiro e arquirrival feroz de Nelson Piquet no mundial épico de 1987." },
    { name: "Riccardo Patrese", country: "Itália 🇮🇹", titles: 0, wins: 6, podiums: 37, poles: 8, rating_offset: -5, description: "Substituiu o lesionado Mansell na corrida final em Adelaide." }
  ],
  "1989_mclaren_honda": [
    { name: "Ayrton Senna", country: "Brasil 🇧🇷", titles: 3, wins: 41, podiums: 80, poles: 65, rating_offset: 1, description: "Bateu rodas freneticamente com Prost na fatídica e controversa batida na chicane de Suzuka." }
  ],
  "1990_mclaren_honda": [
    { name: "Gerhard Berger", country: "Áustria 🇦🇹", titles: 0, wins: 10, podiums: 48, poles: 12, rating_offset: -4, description: "Carismático brincalhão austríaco e amigo íntimo de Senna na lendária equipe." }
  ],
  "1991_mclaren_honda": [
    { name: "Gerhard Berger", country: "Áustria 🇦🇹", titles: 0, wins: 10, podiums: 48, poles: 12, rating_offset: -3, description: "Companheiro carismático de Senna que o ajudou a neutralizar a ameaça das velozes Williams." }
  ],
  "1992_williams_renault": [
    { name: "Riccardo Patrese", country: "Itália 🇮🇹", titles: 0, wins: 6, podiums: 37, poles: 8, rating_offset: -3, description: "Segunda força indiscutível da Williams no auge tecnológico da suspensão ativa." }
  ],
  "1993_williams_renault": [
    { name: "Damon Hill", country: "Reino Unido 🇬🇧", titles: 1, wins: 22, podiums: 42, poles: 20, rating_offset: -4, description: "Herdeiro talentoso britânico que conquistou suas primeiras vitórias sob a tutela de Prost." }
  ],
  "1994_benetton_ford": [
    { name: "Jos Verstappen", country: "Holanda 🇳🇱", titles: 0, wins: 0, podiums: 2, poles: 0, rating_offset: -7, description: "Inexperiente holandês, pai do futuro campeão Max, que encarou a mítica Benetton de 1994." },
    { name: "JJ Lehto", country: "Finlândia 🇫🇮", titles: 0, wins: 0, podiums: 1, poles: 0, rating_offset: -8, description: "Iniciou o ano como piloto titular da Benetton, mas sofreu uma grave lesão na pré-temporada." },
    { name: "Johnny Herbert", country: "Reino Unido 🇬🇧", titles: 0, wins: 3, podiums: 7, poles: 0, rating_offset: -5, description: "Contratado para as últimas provas para guiar o difícil carro azul-celeste." }
  ],
  "1995_benetton_renault": [
    { name: "Johnny Herbert", country: "Reino Unido 🇬🇧", titles: 0, wins: 3, podiums: 7, poles: 0, rating_offset: -4, description: "Conquistou vitórias heroicas em Silverstone e Monza para sacramentar o mundial de construtores." }
  ],
  "1996_williams_renault": [
    { name: "Jacques Villeneuve", country: "Canadá 🇨🇦", titles: 1, wins: 11, podiums: 23, poles: 13, rating_offset: -2, description: "Estreante ousado vindo da IndyCar, travou batalha espetacular com Damon Hill até a prova final." }
  ],
  "1997_williams_renault": [
    { name: "Heinz-Harald Frentzen", country: "Alemanha 🇩🇪", titles: 0, wins: 3, podiums: 18, poles: 2, rating_offset: -4, description: "Piloto extremamente suave, conquistou o GP de Ímola de 1997 com maestria." }
  ],
  "1998_mclaren_mercedes": [
    { name: "David Coulthard", country: "Reino Unido 🇬🇧", titles: 0, wins: 13, podiums: 62, poles: 12, rating_offset: -3, description: "Escudeiro de luxo da McLaren, taticamente leal na lendária dobradinha prateada." }
  ],
  "1999_mclaren_mercedes": [
    { name: "David Coulthard", country: "Reino Unido 🇬🇧", titles: 0, wins: 13, podiums: 62, poles: 12, rating_offset: -3, description: "Segurou as pontas da equipe prateada após as difíceis quebras mecânicas enfrentadas por Häkkinen." }
  ],
  "2000_ferrari": [
    { name: "Rubens Barrichello", country: "Brasil 🇧🇷", titles: 0, wins: 11, podiums: 68, poles: 14, rating_offset: -3, description: "Rubinho. Conquistou sua lendária primeira vitória chorada na chuva da Alemanha em Hockenheim." }
  ],
  "2001_ferrari": [
    { name: "Rubens Barrichello", country: "Brasil 🇧🇷", titles: 0, wins: 11, podiums: 68, poles: 14, rating_offset: -3, description: "Auxiliou a Scuderia a pavimentar o domínio estrondoso da Ferrari na virada do milênio." }
  ],
  "2002_ferrari": [
    { name: "Rubens Barrichello", country: "Brasil 🇧🇷", titles: 0, wins: 11, podiums: 68, poles: 14, rating_offset: -2, description: "Vice-campeão merecido pilotando o icônico e invencível chassi F2002." }
  ],
  "2003_ferrari": [
    { name: "Rubens Barrichello", country: "Brasil 🇧🇷", titles: 0, wins: 11, podiums: 68, poles: 14, rating_offset: -3, description: "Venceu GPs chaves que garantiram a histórica reação de Schumacher contra Raikkonen." }
  ],
  "2005_renault": [
    { name: "Giancarlo Fisichella", country: "Itália 🇮🇹", titles: 0, wins: 3, podiums: 19, poles: 4, rating_offset: -4, description: "Venceu a prova de abertura em Melbourne com o veloz carro azul-amarelo." }
  ],
  "2006_renault": [
    { name: "Giancarlo Fisichella", country: "Itália 🇮🇹", titles: 0, wins: 3, podiums: 19, poles: 4, rating_offset: -3, description: "Garantor do bicampeonato de construtores da escuderia de Enstone." }
  ],
  "2007_ferrari": [
    { name: "Felipe Massa", country: "Brasil 🇧🇷", titles: 0, wins: 11, podiums: 41, poles: 16, rating_offset: -2, description: "O \'Filipinho\'. Dominador de Interlagos, foi magnânimo ao ceder a vitória decisiva a Räikkönen." }
  ],
  "2008_mclaren": [
    { name: "Heikki Kovalainen", country: "Finlândia 🇫🇮", titles: 0, wins: 1, podiums: 4, poles: 1, rating_offset: -5, description: "Venceu o GP da Hungria de 2008 de forma brilhante com a flecha de prata." }
  ],
  "2010_red_bull": [
    { name: "Mark Webber", country: "Austrália 🇦🇺", titles: 0, wins: 9, podiums: 42, poles: 13, rating_offset: -1, description: "Disputou ferozmente o título do ano de 2010 com Vettel, vivendo intriga acalorada." }
  ],
  "2011_red_bull": [
    { name: "Mark Webber", country: "Austrália 🇦🇺", titles: 0, wins: 9, podiums: 42, poles: 13, rating_offset: -3, description: "Ofereceu apoio confiável ao domínio absoluto de Vettel no bicampeonato da Red Bull." }
  ],
  "2013_red_bull": [
    { name: "Mark Webber", country: "Austrália 🇦🇺", titles: 0, wins: 9, podiums: 42, poles: 13, rating_offset: -3, description: "O veterano australiano em seu último ano na categoria, eternizado pelo drama Multi-21." }
  ],
  "2014_mercedes": [
    { name: "Nico Rosberg", country: "Alemanha 🇩🇪", titles: 1, wins: 23, podiums: 57, poles: 30, rating_offset: -1, description: "Travou duelo histórico com Hamilton na famosa \'Batalha do Bahrein\' no ano de introdução dos híbridos." }
  ],
  "2015_mercedes": [
    { name: "Nico Rosberg", country: "Alemanha 🇩🇪", titles: 1, wins: 23, podiums: 57, poles: 30, rating_offset: -1, description: "Bateu de frente com Hamilton no vice-campeonato antes do épico ano seguinte." }
  ],
  "2016_mercedes": [
    { name: "Lewis Hamilton", country: "Reino Unido 🇬🇧", titles: 7, wins: 103, podiums: 197, poles: 104, rating_offset: 1, description: "Arquirrival e companheiro de Rosberg. Perdeu o campeonato por apenas 5 pontos após tensão total em Abu Dhabi." }
  ],
  "2017_mercedes": [
    { name: "Valtteri Bottas", country: "Finlândia 🇫🇮", titles: 0, wins: 10, podiums: 67, poles: 20, rating_offset: -3, description: "Substituiu Rosberg às pressas, trazendo vitórias sólidas para blindar a Mercedes." }
  ],
  "2018_mercedes": [
    { name: "Valtteri Bottas", country: "Finlândia 🇫🇮", titles: 0, wins: 10, podiums: 67, poles: 20, rating_offset: -3, description: "Parceiro estratégico que jogou pelo coletivo para a Mercedes vencer os construtores." }
  ],
  "2020_mercedes": [
    { name: "Valtteri Bottas", country: "Finlândia 🇫🇮", titles: 0, wins: 10, podiums: 67, poles: 20, rating_offset: -3, description: "Segunda força confiável na temporada mais dominante da era moderna alemã." }
  ],
  "2022_red_bull": [
    { name: "Sergio Pérez", country: "México 🇲🇽", titles: 0, wins: 6, podiums: 39, poles: 3, rating_offset: -4, description: "O \'Ministro da Defesa\'. Veloz em circuitos de rua e escudeiro leal do império austríaco." }
  ],
  "2024_red_bull": [
    { name: "Sergio Pérez", country: "México 🇲🇽", titles: 0, wins: 6, podiums: 39, poles: 3, rating_offset: -5, description: "Encarou dificuldades mas seguiu como pilar da equipe austríaca na corrida técnica de 2024." }
  ],
  "2025_mclaren": [
    { name: "Lando Norris", country: "Reino Unido 🇬🇧", titles: 0, wins: 3, podiums: 25, poles: 8, rating_offset: 0, description: "Estrela rápida britânica da McLaren, rivalizando em igualdade com Oscar Piastri." }
  ],
  "2026_audi": [
    { name: "Nico Hülkenberg", country: "Alemanha 🇩🇪", titles: 0, wins: 0, podiums: 0, poles: 1, rating_offset: -2, description: "O \'Hulk\'. Veterano alemão conhecido por sua velocidade em classificação, contratado pela Audi." },
    { name: "Mick Schumacher", country: "Alemanha 🇩🇪", titles: 0, wins: 0, podiums: 0, poles: 0, rating_offset: -8, description: "Piloto reserva de peso carregando o nome mais lendário da história da categoria." }
  ]
};

interface StaffRecord {
  person_id: string;
  nome: string;
  nacionalidade: string;
  role_normalized: 'team_principal' | 'technical_director' | 'chief_designer' | 'chief_engineer' | 'strategy_lead';
  role_display: string;
  equipe_id: string;
  equipe_nome: string;
  ano: number;
  overall: number;
  legacy_tier: string;
  observacao: string;
}

const PRD_STAFF_RECORDS: StaffRecord[] = [
  // Enzo Ferrari
  { person_id: "p001", nome: "Enzo Ferrari", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1950, overall: 95, legacy_tier: "all_time_great", observacao: "Fundador lendário da Ferrari e referência histórica de liderança no paddock." },
  { person_id: "p001", nome: "Enzo Ferrari", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1952, overall: 96, legacy_tier: "all_time_great", observacao: "Consolidação da Ferrari entre as grandes forças do automobilismo." },
  { person_id: "p001", nome: "Enzo Ferrari", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1956, overall: 94, legacy_tier: "all_time_great", observacao: "Liderança inspiradora de Enzo Ferrari comandando a Scuderia." },
  { person_id: "p001", nome: "Enzo Ferrari", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1961, overall: 97, legacy_tier: "all_time_great", observacao: "Período do glorioso chassi Sharknose sob rigorosa regência de Enzo." },
  { person_id: "p001", nome: "Enzo Ferrari", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1975, overall: 93, legacy_tier: "all_time_great", observacao: "Legado duradouro reestabelecendo a mística vermelha com Niki Lauda." },

  // Colin Chapman
  { person_id: "p002", nome: "Colin Chapman", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_lotus", equipe_nome: "Lotus", ano: 1963, overall: 95, legacy_tier: "all_time_great", observacao: "Gênio influente da aerodinâmica e fundador obcecado do revolucionário Team Lotus." },
  { person_id: "p002", nome: "Colin Chapman", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_lotus", equipe_nome: "Lotus", ano: 1965, overall: 96, legacy_tier: "all_time_great", observacao: "Época de imensa soberania técnica do Team Lotus com Jim Clark." },
  { person_id: "p002", nome: "Colin Chapman", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_lotus", equipe_nome: "Lotus", ano: 1970, overall: 95, legacy_tier: "all_time_great", observacao: "Continuidade de liderança vanguardista em inovação aerodinâmica." },
  { person_id: "p002", nome: "Colin Chapman", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_lotus", equipe_nome: "Lotus", ano: 1978, overall: 98, legacy_tier: "all_time_great", observacao: "Auge definitivo de inovação trazendo o conceito revolucionário de efeito solo." },

  // Frank Williams
  { person_id: "p003", nome: "Frank Williams", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1979, overall: 89, legacy_tier: "legend", observacao: "Ascensão impetuosa do clássico império Williams fundada e liderada por ele." },
  { person_id: "p003", nome: "Frank Williams", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1980, overall: 94, legacy_tier: "legend", observacao: "Primeiro título mundial com Alan Jones, estabelecendo a Williams na elite." },
  { person_id: "p003", nome: "Frank Williams", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1986, overall: 97, legacy_tier: "legend", observacao: "Garagem consolidada como força dominante em acirradas disputas internas." },
  { person_id: "p003", nome: "Frank Williams", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1992, overall: 98, legacy_tier: "legend", observacao: "Auge absoluto da equipe com o indomável e tecnológico carro FW14B superativo." },
  { person_id: "p003", nome: "Frank Williams", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal / Founder", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1996, overall: 98, legacy_tier: "legend", observacao: "Ciclo brilhante de vitórias sob o comando operacional impecável de Frank." },

  // Ron Dennis
  { person_id: "p004", nome: "Ron Dennis", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1984, overall: 95, legacy_tier: "legend", observacao: "Gerente ultra perfeccionista, unificou a McLaren estabelecendo a máquina vitoriosa moderna." },
  { person_id: "p004", nome: "Ron Dennis", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1988, overall: 99, legacy_tier: "legend", observacao: "Temporada mítica de supremacia avassaladora com a dupla Ayrton Senna e Alain Prost." },
  { person_id: "p004", nome: "Ron Dennis", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1991, overall: 97, legacy_tier: "legend", observacao: "Rigor máximo de engenharia e gestão tática mantendo a McLaren no topo esportivo." },
  { person_id: "p004", nome: "Ron Dennis", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1998, overall: 96, legacy_tier: "legend", observacao: "Superação técnica magistral para trazer os títulos consagrados de Mika Häkkinen." },
  { person_id: "p004", nome: "Ron Dennis", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 2008, overall: 93, legacy_tier: "legend", observacao: "Último grande título mundial conquistado por pilotos de sua dinastia com Hamilton." },

  // Jean Todt
  { person_id: "p005", nome: "Jean Todt", nacionalidade: "FRA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1994, overall: 88, legacy_tier: "elite", observacao: "Início da histórica reestruturação militarista de Maranello pós-Crise." },
  { person_id: "p005", nome: "Jean Todt", nacionalidade: "FRA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 2000, overall: 96, legacy_tier: "elite", observacao: "Scuderia transformada em poderosa máquina de vitórias com Michael Schumacher." },
  { person_id: "p005", nome: "Jean Todt", nacionalidade: "FRA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 2002, overall: 98, legacy_tier: "elite", observacao: "Auge monumental de eficiência esportiva, logística e trabalho de mureta vermelha." },
  { person_id: "p005", nome: "Jean Todt", nacionalidade: "FRA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 2004, overall: 99, legacy_tier: "elite", observacao: "Pontuação recorde absoluta na mítica e invencível era de ouro Schumacher-Todt-Brawn." },

  // Flavio Briatore
  { person_id: "p006", nome: "Flavio Briatore", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_benetton", equipe_nome: "Benetton", ano: 1994, overall: 92, legacy_tier: "great", observacao: "Gestão esportiva de enorme agressividade e faro comercial campeã com Schumacher." },
  { person_id: "p006", nome: "Flavio Briatore", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_benetton", equipe_nome: "Benetton", ano: 1995, overall: 95, legacy_tier: "great", observacao: "Temporada estelar de duplo campeonato coroando a estrutura de Enstone." },
  { person_id: "p006", nome: "Flavio Briatore", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_renault", equipe_nome: "Renault", ano: 2005, overall: 95, legacy_tier: "great", observacao: "Trabalho impecável de suporte a Fernando Alonso destronando a toda-poderosa Ferrari." },
  { person_id: "p006", nome: "Flavio Briatore", nacionalidade: "ITA", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_renault", equipe_nome: "Renault", ano: 2006, overall: 95, legacy_tier: "great", observacao: "Bicampeonato marcante focado em táticas inovadoras de pit stop." },

  // Christian Horner
  { person_id: "p007", nome: "Christian Horner", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2010, overall: 95, legacy_tier: "elite", observacao: "Primeiro título estelar de construtores da Red Bull erguendo um novo império na F1." },
  { person_id: "p007", nome: "Christian Horner", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2011, overall: 97, legacy_tier: "elite", observacao: "Conduziu a garagem austríaca a uma extraordinária e soberana temporada com Vettel." },
  { person_id: "p007", nome: "Christian Horner", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2013, overall: 98, legacy_tier: "elite", observacao: "Fechamento impecável do ciclo do tetracampeonato em pleno domínio político-desportivo." },
  { person_id: "p007", nome: "Christian Horner", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2022, overall: 97, legacy_tier: "elite", observacao: "Soberba adaptação ao regulamento de efeito solo, restabelecendo o time no topo." },
  { person_id: "p007", nome: "Christian Horner", nacionalidade: "GBR", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2023, overall: 99, legacy_tier: "elite", observacao: "Ano estatisticamente mais esmagador da história, liderado com maestria operacional." },

  // Toto Wolff
  { person_id: "p008", nome: "Toto Wolff", nacionalidade: "AUT", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2014, overall: 97, legacy_tier: "legend", observacao: "Início triunfal da mais assustadora e consistente dinastia vitoriosa na era híbrida." },
  { person_id: "p008", nome: "Toto Wolff", nacionalidade: "AUT", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2016, overall: 99, legacy_tier: "legend", observacao: "Gerenciamento implacável da monumental guerra interna entre Hamilton e Rosberg." },
  { person_id: "p008", nome: "Toto Wolff", nacionalidade: "AUT", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2019, overall: 99, legacy_tier: "legend", observacao: "Rigor fabril supremo atingindo níveis inacreditáveis de constância operacional e vitórias." },
  { person_id: "p008", nome: "Toto Wolff", nacionalidade: "AUT", role_normalized: "team_principal", role_display: "Team Principal", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2020, overall: 99, legacy_tier: "legend", observacao: "Consagração absoluta com a Mercedes preta, faturando o heptacampeonato consecutivo." },

  // Adrian Newey
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "chief_designer", role_display: "Chief Designer", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1991, overall: 88, legacy_tier: "legend", observacao: "Início do traçado de bólidos de Williams com suspensão revolucionária." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "chief_designer", role_display: "Chief Designer", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1992, overall: 94, legacy_tier: "legend", observacao: "Concebeu o bólido de suspensão ativa e eletrônica FW14B, devastador das pistas." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "chief_designer", role_display: "Chief Designer", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1993, overall: 95, legacy_tier: "legend", observacao: "Extraordinária inteligência refinando fluxos sob o regulamento eletrônico." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "chief_designer", role_display: "Chief Designer", equipe_id: "t_williams", equipe_nome: "Williams", ano: 1996, overall: 95, legacy_tier: "legend", observacao: "Mais um chassi primoroso equilibrado aerodinamicamente de Newey campeão absoluto." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1998, overall: 93, legacy_tier: "legend", observacao: "Arquiteto das aerodinâmicas flechas de prata prateadas e campeãs de Mika Häkkinen." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1999, overall: 93, legacy_tier: "legend", observacao: "Equilíbrio de chassi e fluxos impecáveis de downforce na mítica flecha de prata." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2010, overall: 97, legacy_tier: "legend", observacao: "Iniciou desenhando asas dianteiras flexíveis e fluxos inovadores na Red Bull." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2011, overall: 98, legacy_tier: "legend", observacao: "Concebeu o genial difusor soprado que domou as derrapagens traseiras de Sebastian Vettel." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2013, overall: 98, legacy_tier: "legend", observacao: "Auge aerodinâmico e canalização de venturi garantindo ampla supremacia." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2022, overall: 98, legacy_tier: "legend", observacao: "Mestre supremo da geometria de canais sob efeito solo, erradicando os saltos crônicos." },
  { person_id: "p009", nome: "Adrian Newey", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2023, overall: 99, legacy_tier: "legend", observacao: "A obra-prima aerodinâmica definitiva: arrasto nulo com o flap da asa aberto e downforce infinito." },

  // James Allison
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "chief_engineer", role_display: "Head of Aerodynamics", equipe_id: "t_benetton", equipe_nome: "Benetton", ano: 1994, overall: 83, legacy_tier: "great", observacao: "Desenvolvimento aerodinâmico chave do ágil bólido bicolor de Schumacher." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "chief_engineer", role_display: "Head of Aerodynamics", equipe_id: "t_benetton", equipe_nome: "Benetton", ano: 1995, overall: 86, legacy_tier: "great", observacao: "Participação em aerodinâmica otimizada de Enstone no duplo título campeão." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "chief_engineer", role_display: "Trackside Aerodynamicist", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 2000, overall: 88, legacy_tier: "great", observacao: "Integrado ao formidável painel técnico de suporte aerodinâmico em Maranello." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "chief_engineer", role_display: "Trackside Aerodynamicist", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 2004, overall: 91, legacy_tier: "great", observacao: "Auxiliou no cálculo de downforce excepcional do imbatível bólido F2004." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_renault", equipe_nome: "Renault", ano: 2009, overall: 89, legacy_tier: "elite", observacao: "Assumiu a liderança de engenharia emEnstone desenvolvendo suspensões compactas." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 2015, overall: 90, legacy_tier: "elite", observacao: "Diretor técnico encarregado de revitalizar os bicos e suspensão dianteira da Scuderia." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2017, overall: 94, legacy_tier: "elite", observacao: "Líder de chassi da Mercedes, moldando as flechas a responder as complexidades de pneus." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2019, overall: 96, legacy_tier: "elite", observacao: "Engenheiro de mestre-chave responsável pelo brilhante e inovador sistema DAS." },
  { person_id: "p010", nome: "James Allison", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2020, overall: 96, legacy_tier: "elite", observacao: "Estruturou o maravilhoso chassi W11, considerado o carro mais veloz da F1 moderna." },

  // Paddy Lowe
  { person_id: "p011", nome: "Paddy Lowe", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 1998, overall: 87, legacy_tier: "elite", observacao: "Liderou desenvolvimento dinâmico e suspensão ativa chave dos anos de glória da McLaren." },
  { person_id: "p011", nome: "Paddy Lowe", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mclaren", equipe_nome: "McLaren", ano: 2008, overall: 90, legacy_tier: "elite", observacao: "Desenvolveu o chassi campeão de Hamilton com suspensão traseira rígida." },
  { person_id: "p011", nome: "Paddy Lowe", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2014, overall: 95, legacy_tier: "elite", observacao: "Supervisão cirúrgica de engenharia integrada no início da máquina recordista alemã." },
  { person_id: "p011", nome: "Paddy Lowe", nacionalidade: "GBR", role_normalized: "technical_director", role_display: "Technical Director", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2016, overall: 96, legacy_tier: "elite", observacao: "Estabilidade mecânica extrema e inovações de freio no domínio estelar híbrido." },

  // James Vowles
  { person_id: "p012", nome: "James Vowles", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_brawn", equipe_nome: "Brawn GP", ano: 2009, overall: 88, legacy_tier: "elite", observacao: "Coordenador tático audaz que organizou paradas cruciais de Button na improvável conquista." },
  { person_id: "p012", nome: "James Vowles", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2014, overall: 94, legacy_tier: "elite", observacao: "Engenhosas chamadas táticas preventivas neutralizando undercuts de oponentes." },
  { person_id: "p012", nome: "James Vowles", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2016, overall: 96, legacy_tier: "elite", observacao: "O cérebro tático que gerenciava as rotas de mureta com agressão e frieza cirúrgica." },
  { person_id: "p012", nome: "James Vowles", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_mercedes", equipe_nome: "Mercedes", ano: 2019, overall: 97, legacy_tier: "elite", observacao: "Domínio de simulações em tempo real mantendo a mureta infalível a safety-cars." },

  // Hannah Schmitz
  { person_id: "p013", nome: "Hannah Schmitz", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Head of Race Strategy", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2019, overall: 86, legacy_tier: "great", observacao: "Destaque nas tomadas de decisão sob o caos de asfalto molhado em Interlagos." },
  { person_id: "p013", nome: "Hannah Schmitz", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Head of Race Strategy", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2021, overall: 91, legacy_tier: "elite", observacao: "Pitstops em janelas perfeitas para travar taticamente o império da Mercedes." },
  { person_id: "p013", nome: "Hannah Schmitz", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Head of Race Strategy", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2022, overall: 93, legacy_tier: "elite", observacao: "Lenda do pit-wall. Chamadas brilhantes de pneus falsos induzindo adversários ao erro em Mônaco e Hungria." },
  { person_id: "p013", nome: "Hannah Schmitz", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Head of Race Strategy", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2023, overall: 95, legacy_tier: "elite", observacao: "Leitura cirúrgica em rádio impecável guiando a Red Bull na maior sequência vitoriosa." },

  // Neil Martin
  { person_id: "p014", nome: "Neil Martin", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2007, overall: 85, legacy_tier: "great", observacao: "Inovou na infraestrutura de softwares proprietários de simulação estatística." },
  { person_id: "p014", nome: "Neil Martin", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2010, overall: 90, legacy_tier: "great", observacao: "Simulações precisas de tráfego que renderam o primeiro título mundial de Vettel." },
  { person_id: "p014", nome: "Neil Martin", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Chief Strategist", equipe_id: "t_redbull", equipe_nome: "Red Bull Racing", ano: 2011, overall: 91, legacy_tier: "great", observacao: "Dominância nas chamadas rápidas antevendo comportamento dinâmico de pneus Pirelli." },

  // Ruth Buscombe
  { person_id: "p015", nome: "Ruth Buscombe", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Strategy Engineer", equipe_id: "t_sauber", equipe_nome: "Sauber", ano: 2016, overall: 82, legacy_tier: "solid", observacao: "Incríveis leituras de pit stops que deram pontos de ouro vitais à Sauber." },
  { person_id: "p015", nome: "Ruth Buscombe", nacionalidade: "GBR", role_normalized: "strategy_lead", role_display: "Strategy Engineer", equipe_id: "t_alfa_romeo", equipe_nome: "Alfa Romeo", ano: 2018, overall: 84, legacy_tier: "solid", observacao: "Operadora destacada na mureta suíça, famosa pela agilidade em asfalto instável." },

  // Mauro Forghieri
  { person_id: "p016", nome: "Mauro Forghieri", nacionalidade: "ITA", role_normalized: "chief_designer", role_display: "Technical Leader / Designer", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1964, overall: 91, legacy_tier: "all_time_great", observacao: "Superprojetista de Maranello, desenhou o motor lendário do título de John Surtees." },
  { person_id: "p016", nome: "Mauro Forghieri", nacionalidade: "ITA", role_normalized: "chief_designer", role_display: "Technical Leader / Designer", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1975, overall: 96, legacy_tier: "all_time_great", observacao: "Arquiteta do revolucionário câmbio transversal na clássica série campeã 312T." },
  { person_id: "p016", nome: "Mauro Forghieri", nacionalidade: "ITA", role_normalized: "chief_designer", role_display: "Technical Leader / Designer", equipe_id: "t_ferrari", equipe_nome: "Ferrari", ano: 1977, overall: 95, legacy_tier: "all_time_great", observacao: "Mito dos boxes vermelhos comandando chassis e mecânica com perfeição pura." }
];

const mapRoleType = (role: string): 'boss' | 'engineer' | 'strategist' => {
  if (role === 'team_principal') return 'boss';
  if (role === 'strategy_lead') return 'strategist';
  return 'engineer';
};

const mapNacionalidade = (nac: string): string => {
  const n = nac.toUpperCase();
  if (n === 'ITA') return 'Itália 🇮🇹';
  if (n === 'GBR') return 'Reino Unido 🇬🇧';
  if (n === 'FRA') return 'França 🇫🇷';
  if (n === 'AUT') return 'Áustria 🇦🇹';
  if (n === 'GER' || n === 'DEU') return 'Alemanha 🇩🇪';
  if (n === 'BRA') return 'Brasil 🇧🇷';
  if (n === 'USA') return 'Estados Unidos 🇺🇸';
  if (n === 'SUI') return 'Suíça 🇨🇭';
  if (n === 'NZL') return 'Nova Zelândia 🇳🇿';
  if (n === 'AUS') return 'Austrália 🇦🇺';
  if (n === 'FIN') return 'Finlândia 🇫🇮';
  if (n === 'MEX') return 'México 🇲🇽';
  if (n === 'ESP') return 'Espanha 🇪🇸';
  if (n === 'ARG') return 'Argentina 🇦🇷';
  if (n === 'IND') return 'Índia 🇮🇳';
  if (n === 'ROM') return 'Romênia 🇷🇴';
  return 'Mundo 🌐';
};

const getDefaultDesc = (nome: string, team: string, season: number, role: 'boss' | 'engineer' | 'strategist') => {
  if (role === 'boss') return `${nome}, diretor de equipe que organizou processos operacionais e de paddock para a escuderia ${team} em ${season}.`;
  if (role === 'engineer') return `${nome}, diretor técnico e designer responsável por equilibrar a aerodinâmica e o comportamento mecânico da equipe ${team} em ${season}.`;
  return `${nome}, mestre tático calibrando simulações de pit-wall precisas para a equipe ${team} em ${season}.`;
};

const isTeamMatch = (recTeam: string, queryTeam: string) => {
  const normRec = recTeam.toLowerCase().replace(/[^a-z0-9]/g, '');
  return queryTeam.includes(normRec) || normRec.includes(queryTeam) ||
         (queryTeam.includes('redbull') && normRec.includes('redbull')) ||
         (queryTeam.includes('mclaren') && normRec.includes('mclaren')) ||
         (queryTeam.includes('ferrari') && normRec.includes('ferrari')) ||
         (queryTeam.includes('williams') && normRec.includes('williams')) ||
         (queryTeam.includes('renault') && normRec.includes('renault')) ||
         (queryTeam.includes('benetton') && normRec.includes('benetton')) ||
         (queryTeam.includes('mercedes') && normRec.includes('mercedes')) ||
         (queryTeam.includes('lotus') && normRec.includes('lotus')) ||
         (queryTeam.includes('sauber') && normRec.includes('sauber')) ||
         (queryTeam.includes('alfa') && normRec.includes('alfa'));
};

const getBackupStaff = (teamName: string, season: number, role: 'boss' | 'engineer' | 'strategist', avgRating: number) => {
  const t = teamName.toLowerCase();
  
  if (t.includes('ferrari')) {
    if (role === 'boss') {
      if (season <= 1977) return { name: "Enzo Ferrari", country: "Itália 🇮🇹", description: "O comendador supremo de Maranello. Sua mística impunha respeito absoluto no paddock." };
      if (season <= 1988) return { name: "Marco Piccinini", country: "Itália 🇮🇹", description: "Liderou a Scuderia nos históricos anos de glórias de Scheckter e Villeneuve." };
      if (season <= 1992) return { name: "Cesare Fiorio", country: "Itália 🇮🇹", description: "Diretor esportivo lendário, coordenador tático da rivalidade Prost-Senna na Ferrari." };
      if (season <= 2007) return { name: "Jean Todt", country: "França 🇫🇷", description: "Comandante supremo da mítica era Schumacher; blindou Maranello contra qualquer pressão esportiva." };
      if (season <= 2014) return { name: "Stefano Domenicali", country: "Itália 🇮🇹", description: "Chefe respeitado pela diplomacia e gestão de pilotos nas disputas acirradas de Fernando Alonso." };
      return { name: "Frédéric Vasseur", country: "França 🇫🇷", description: "Líder direto e pragmático focado em reestruturação operacional e atração de superestrelas." };
    }
    if (role === 'engineer') {
      if (season <= 1961) return { name: "Carlo Chiti", country: "Itália 🇮🇹", description: "Gênio do chassi de motor traseiro 'Sharknose' campeão de 1961." };
      if (season <= 1984) return { name: "Mauro Forghieri", country: "Itália 🇮🇹", description: "Mente brilhante que desenhou o extraordinário motor boxer flat-12 e chassis campeões dos anos 70." };
      if (season <= 1995) return { name: "John Barnard", country: "Reino Unido 🇬🇧", description: "Inovador revolucionário que concebeu o pioneiro câmbio semiautomático com borboleta no volante da F1." };
      if (season <= 2006) return { name: "Rory Byrne", country: "África do Sul 🇿🇦", description: "Mestre sul-africano do design. Elaborou carros brilhantes de perfeita aderência e equilíbrio dinâmico." };
      if (season <= 2013) return { name: "Aldo Costa", country: "Itália 🇮🇹", description: "Projetista astuto de Maranello, responsável técnico pelos bólidos campeões de 2007 e 2008." };
      return { name: "James Allison", country: "Reino Unido 🇬🇧", description: "Diretor técnico renomado, restaurou a eficácia aerodinâmica e equilíbrio de potência das mulas vermelhas." };
    }
    if (role === 'strategist') {
      if (season <= 1996) return { name: "Luca Baldisserri", country: "Itália 🇮🇹", description: "Veterano engenheiro de pista, ágil mestre de cronometragem clássico de Maranello." };
      if (season <= 2006) return { name: "Ross Brawn", country: "Reino Unido 🇬🇧", description: "Gênio absoluto do pit wall. Chamadas audaciosas de paradas múltiplas que venciam corridas impossíveis." };
      if (season <= 2010) return { name: "Chris Dyer", country: "Austrália 🇦🇺", description: "Engenheiro de estratégia responsável pelas táticas cirúrgicas de título de Kimi Räikkönen em 2007." };
      if (season <= 2022) return { name: "Iñaki Rueda", country: "Espanha 🇪🇸", description: "Coordenador técnico de pit wall responsável por simulações táticas em corridas complexas de safety-car." };
      return { name: "Ravin Jain", country: "Reino Unido 🇬🇧", description: "Promissor estrategista-chefe britânico impulsionado para simplificar e dar lógica estatística fria aos boxes vermelhos." };
    }
  }

  if (t.includes('mclaren')) {
    if (role === 'boss') {
      if (season <= 1970) return { name: "Bruce McLaren", country: "Nova Zelândia 🇳🇿", description: "Fundador herói, cujo espírito e garra moldaram para sempre o DNA vencedor e indomável da escuderia." };
      if (season <= 1980) return { name: "Teddy Mayer", country: "Estados Unidos 🇺🇸", description: "Dirigiu a McLaren faturando os memoráveis títulos mundiais de Fittipaldi (1974) e James Hunt (1976)." };
      if (season <= 2008) return { name: "Ron Dennis", country: "Reino Unido 🇬🇧", description: "Líder lendário obcecado pelo perfeccionismo. Concebeu os anos dourados e dominantes de Senna e Prost." };
      if (season <= 2013) return { name: "Martin Whitmarsh", country: "Reino Unido 🇬🇧", description: "Gerenciou a transição pós-Dennis mantendo a equipe no epicentro das vitórias no grid." };
      if (season <= 2018) return { name: "Eric Boullier", country: "França 🇫🇷", description: "Assumiu as decisões desportivas da tradicional equipe britânica em uma fase técnica desafiadora." };
      return { name: "Andrea Stella", country: "Itália 🇮🇹", description: "Líder de mureta brilhante e humilde, reestruturou a McLaren transformando o chassi em um canhão campeão." };
    }
    if (role === 'engineer') {
      if (season <= 1980) return { name: "Gordon Coppuck", country: "Reino Unido 🇬🇧", description: "Projetou o clássico monoplaza M23, referência absoluta de robustez mecânica na década de 70." };
      if (season <= 1987) return { name: "John Barnard", country: "Reino Unido 🇬🇧", description: "Pioneiro absoluto ao revolucionar a indústria introduzindo chassi monocoque inteiramente de fibra de carbono." };
      if (season <= 1996) return { name: "Neil Oatley", country: "Reino Unido 🇬🇧", description: "Mestre refinado, desenhou os lendários e ágeis bólidos vencedores de múltiplos campeonatos da McLaren." };
      if (season <= 2005) return { name: "Adrian Newey", country: "Reino Unido 🇬🇧", description: "Diretor aerodinâmico mestre que concebeu as ágeis flechas de prata campeãs de Mika Häkkinen." };
      if (season <= 2013) return { name: "Paddy Lowe", country: "Reino Unido 🇬🇧", description: "Gerenciou inovações de suspensão e rigidez torcional crucial para a conquista de Lewis Hamilton em 2008." };
      return { name: "Rob Marshall", country: "Reino Unido 🇬🇧", description: "Ex-mago da Red Bull contratado pela McLaren; arquiteto dinâmico central da escalada aerodinâmica recente." };
    }
    if (role === 'strategist') {
      if (season <= 1997) return { name: "Tyler Alexander", country: "Estados Unidos 🇺🇸", description: "Lenda operacional da McLaren clássica, cofundador cujo rigor de cronômetro imperava nos boxes." };
      if (season <= 2008) return { name: "Paddy Lowe", country: "Reino Unido 🇬🇧", description: "Coordenou mureta técnica com simulações estatísticas em tempo real na era prateada." };
      return { name: "Randy Singh", country: "Reino Unido 🇬🇧", description: "Diretor tático de alto nível conhecido por focar em undercuts cirúrgicos e excelente modelagem matemática." };
    }
  }

  if (t.includes('mercedes')) {
    if (role === 'boss') {
      if (season <= 2013) return { name: "Ross Brawn", country: "Reino Unido 🇬🇧", description: "Lenda dos boxes, comprou a equipe e estruturou os pilares modernos e fabris da escuderia alemã." };
      return { name: "Toto Wolff", country: "Áustria 🇦🇹", description: "Líder e acionista vitorioso da Mercedes, conquistou imponentes 8 títulos de construtores recordistas na F1." };
    }
    if (role === 'engineer') {
      if (season <= 2013) return { name: "Aldo Costa", country: "Itália 🇮🇹", description: "Projetista-chefe italiano, alinhou as suspensões e chassis que definiriam a hegemonia de 2014." };
      if (season <= 2016) return { name: "Paddy Lowe", country: "Reino Unido 🇬🇧", description: "Gerenciou as inovações mecânicas integradas à formidável unidade de potência híbrida alemã." };
      return { name: "James Allison", country: "Reino Unido 🇬🇧", description: "Líder técnico absoluto das flechas de prata, garantindo extraordinária downforce e comportamento de pneus." };
    }
    if (role === 'strategist') {
      if (season <= 2022) return { name: "James Vowles", country: "Reino Unido 🇬🇧", description: "Estrategista de elite, famoso pela frieza operacional em disputas táticas brutas de pista." };
      return { name: "Rosie Wait", country: "Reino Unido 🇬🇧", description: "Supervisora estatística brilhante de corrida, dita as rotas táticas das flechas de prata contemporâneas." };
    }
  }

  if (t.includes('red bull') || t.includes('redbull')) {
    if (role === 'boss') {
      return { name: "Christian Horner", country: "Reino Unido 🇬🇧", description: "Dirigiu a Red Bull com pulso firme e ironia sagaz, guiando a equipe de estreante a potência vencedora eterna." };
    }
    if (role === 'engineer') {
      if (season <= 2023) return { name: "Adrian Newey", country: "Reino Unido 🇬🇧", description: "O maior projetista da história. Mago absoluto na canalização de efeito solo e fluxos de ar limpos." };
      return { name: "Pierre Waché", country: "França 🇫🇷", description: "Diretor de engenharia pragmático, pilota o desenho mecânico e suspensões modernas da Red Bull." };
    }
    if (role === 'strategist') {
      if (season <= 2009) return { name: "Neil Martin", country: "Reino Unido 🇬🇧", description: "Inovador pioneiro na modelagem preditiva de tráfego de pit wall na Fórmula 1 moderna." };
      if (season <= 2018) return { name: "Will Courtenay", country: "Reino Unido 🇬🇧", description: "Chefe de estratégia preciso, arquiteto de corrida das gloriosas conquistas de Sebastian Vettel." };
      return { name: "Hannah Schmitz", country: "Reino Unido 🇬🇧", description: "Lenda viva da mureta Red Bull. Reações cerebrais perfeitas sob chuva espantando os rivais de surpresa." };
    }
  }

  if (t.includes('williams')) {
    if (role === 'boss') {
      if (season <= 2012) return { name: "Frank Williams", country: "Reino Unido 🇬🇧", description: "O lendário guerreiro de garagem britânico. Construiu uma lenda mítica com brio e mecânica pura." };
      if (season <= 2020) return { name: "Claire Williams", country: "Reino Unido 🇬🇧", description: "Assumiu a direção da equipe da família, lutando bravamente em períodos de dificuldades econômicas." };
      if (season <= 2022) return { name: "Jost Capito", country: "Alemanha 🇩🇪", description: "Veterano gestor de automobilismo trazido para rejuvenescer a fundação administrativa do time." };
      return { name: "James Vowles", country: "Reino Unido 🇬🇧", description: "Mente tática brilhante vinda da Mercedes, assume a gerência trazendo moderno e rigoroso processo técnico." };
    }
    if (role === 'engineer') {
      if (season <= 1990) return { name: "Patrick Head", country: "Reino Unido 🇬🇧", description: "Cofundador técnico lendário, impôs rigores de confiabilidade e inovação mecânica pioneira." };
      if (season <= 1996) return { name: "Adrian Newey", country: "Reino Unido 🇬🇧", description: "Projetou os bólidos de Williams com eletrônica embarcada e suspensão ativa que devastaram o grid." };
      if (season <= 2011) return { name: "Patrick Head", country: "Reino Unido 🇬🇧", description: "Diretor de engenharia experiente, segurou as pontas mecânicas da garagem britânica na era V8." };
      if (season <= 2018) return { name: "Pat Symonds", country: "Reino Unido 🇬🇧", description: "Coordenou o desenvolvimento aerodinâmico eficiente em retas velozes nas campanhas V6 híbridas." };
      return { name: "Pat Fry", country: "Reino Unido 🇬🇧", description: "Engenheiro prestigiado encarregado de reestruturar a aerodinâmica e refinamento de bicos da Williams." };
    }
    if (role === 'strategist') {
      if (season <= 2013) return { name: "Dickie Stanford", country: "Reino Unido 🇬🇧", description: "Veterano engenheiro de rádio famoso nos anos áureos, conselheiro tático leal da equipe." };
      if (season <= 2018) return { name: "Rob Smedley", country: "Reino Unido 🇬🇧", description: "Ex-engenheiro de pista de Massa na Ferrari, liderou decisões estratégicas nos boxes da Williams." };
      return { name: "James Vowles", country: "Reino Unido 🇬🇧", description: "O próprio gerente de equipe que assume decisões cruciais de pit wall com rigor de dados puros." };
    }
  }

  if (t.includes('renault') || t.includes('alpine')) {
    if (role === 'boss') {
      if (season <= 1984) return { name: "Gérard Larrousse", country: "França 🇫🇷", description: "Comandou a equipe francesa pioneira na revolução dos motores turbo de F1." };
      if (season <= 2009) return { name: "Flavio Briatore", country: "Itália 🇮🇹", description: "Comandando com frieza comercial e agressividade de negócios nos bicampeonatos de Alonso." };
      if (season <= 2013) return { name: "Éric Boullier", country: "França 🇫🇷", description: "Gerenciou a mureta da Lotus-Renault faturando belíssimas vitórias com Kimi Räikkönen." };
      if (season <= 2021) return { name: "Cyril Abiteboul", country: "França 🇫🇷", description: "Ficou famoso pelo carisma e paixão ao capitanear a transição da equipe de fábrica da Renault." };
      return { name: "Otmar Szafnauer", country: "Estados Unidos 🇺🇸", description: "Chefe operacional de pista consolidado, escalado para unificar a equipe francesa." };
    }
    if (role === 'engineer') {
      if (season <= 2008) return { name: "Bob Bell", country: "Reino Unido 🇬🇧", description: "Projetista genial, concebeu o vitorioso chassi com inovadores amortecedores de massa em 2005." };
      if (season <= 2013) return { name: "James Allison", country: "Reino Unido 🇬🇧", description: "Diretor de engenharia, desenhou escapamentos inteligentes que redefiniram o downforce traseiro." };
      return { name: "David Sanchez", country: "França 🇫🇷", description: "Engenheiro renomado focado em fluxos venturi e assoalhos aerodinâmicos na era de efeito solo." };
    }
    if (role === 'strategist') {
      if (season <= 2009) return { name: "Pat Symonds", country: "Reino Unido 🇬🇧", description: "Estrategista de altíssimo escalão, mestre em gerenciar tanques extras leves nas largadas." };
      return { name: "Alan Permane", country: "Reino Unido 🇬🇧", description: "Veterano tático encarregado de simplificar chamadas estatísticas sobre safety-cars." };
    }
  }

  if (t.includes('benetton')) {
    if (role === 'boss') {
      if (season <= 1988) return { name: "Peter Collins", country: "Reino Unido 🇬🇧", description: "Liderou a Benetton em suas históricas primeiras vitórias com visual colorido." };
      return { name: "Flavio Briatore", country: "Itália 🇮🇹", description: "Montou a indomável estrutura bicolor que rendeu os primeiros mundiais com Schumacher." };
    }
    if (role === 'engineer') {
      if (season <= 1991) return { name: "John Barnard", country: "Reino Unido 🇬🇧", description: "Inovador aerodinâmico que desenhou radiadores e bicos icônicos integrados." };
      return { name: "Rory Byrne", country: "África do Sul 🇿🇦", description: "Desenhou bólidos ágeis com bico extremamente elevado, alterando o padrão geométrico da F1." };
    }
    if (role === 'strategist') {
      return { name: "Pat Symonds", country: "Reino Unido 🇬🇧", description: "Mestre tático experiente de mureta nos anos áureos da Benetton bicolor." };
    }
  }

  if (t.includes('lotus')) {
    if (role === 'boss') {
      if (season <= 1982) return { name: "Colin Chapman", country: "Reino Unido 🇬🇧", description: "Gênio lendário supremo da Lotus, cuja paixão por inovar dita a engenharia dos bólidos." };
      return { name: "Peter Warr", country: "Reino Unido 🇬🇧", description: "Liderou a tradicional garagem preta e dourada de Ayrton Senna com pulso implacável." };
    }
    if (role === 'engineer') {
      if (season <= 1982) return { name: "Colin Chapman", country: "Reino Unido 🇬🇧", description: "Inovador sem limites que introduziu o efeito solo e bolds monocoque na F1." };
      return { name: "Gérard Ducarouge", country: "França 🇫🇷", description: "Engenheiro renomado, concebeu chassis velozes sob medida para o motor Renault de Senna." };
    }
    if (role === 'strategist') {
      return { name: "Peter Warr", country: "Reino Unido 🇬🇧", description: "Administrador e coordenador tático leal da prestigiosa garagem nos anos 80." };
    }
  }

  if (t.includes('brabham')) {
    if (role === 'boss') {
      if (season <= 1969) return { name: "Jack Brabham", country: "Austrália 🇦🇺", description: "Liderou o paddock vencendo o campeonato mundial guiando seu próprio carro Brabham." };
      return { name: "Bernie Ecclestone", country: "Reino Unido 🇬🇧", description: "Liderou a Brabham em uma época visionária com reabastecimentos de pista rápidos e asfalto quente." };
    }
    if (role === 'engineer') {
      if (season <= 1971) return { name: "Ron Tauranac", country: "Austrália 🇦🇺", description: "Desenhou chassis tubulares imbatíveis em robustez e adaptabilidade a pistas severas." };
      return { name: "Gordon Murray", country: "África do Sul 🇿🇦", description: "Lenda do design, criou o lendário bólido com ventilador traseiro BT46B e bólidos compactos." };
    }
    if (role === 'strategist') {
      return { name: "Herbie Blash", country: "Reino Unido 🇬🇧", description: "Lendário assessor tático de boxes de Bernie, controlando pitstops precisos de reabastecimento." };
    }
  }

  if (t.includes('tyrrell')) {
    if (role === 'boss') {
      return { name: "Ken Tyrrell", country: "Reino Unido 🇬🇧", description: "Lendário 'Tio Ken'. Coordenador carismático e descobridor ferrenho de lendas na F1." };
    }
    if (role === 'engineer') {
      if (season <= 1979) return { name: "Derek Gardner", country: "Reino Unido 🇬🇧", description: "Mente criativa brilhante que desenvolveu o lendário e ousado bólido de seis rodas P34." };
      return { name: "Harvey Postlethwaite", country: "Reino Unido 🇬🇧", description: "Pioneiro da suspensão dianteira alta activa e downforces agudos frontais." };
    }
    if (role === 'strategist') {
      return { name: "Ken Tyrrell", country: "Reino Unido 🇬🇧", description: "Comandante tático supremo de pista, conhecido pelo rádio estrondoso de autoridade nos boxes." };
    }
  }

  if (t.includes('brawn')) {
    if (role === 'boss') return { name: "Ross Brawn", country: "Reino Unido 🇬🇧", description: "Arquiteto genial da improvável ressurreição da equipe Honda faturando o duplo campeonato de 2009." };
    if (role === 'engineer') return { name: "Loïc Bigois", country: "França 🇫🇷", description: "Gênio aerodinâmico que desenhou o famigerado e revolucionário difusor duplo campeão de 2009." };
    if (role === 'strategist') return { name: "James Vowles", country: "Reino Unido 🇬🇧", description: "Aproveitou cada brecha estatística de pista garantindo vitórias consistentes a Jenson Button." };
  }

  if (t.includes('sauber') || t.includes('alfa romeo') || t.includes('audi')) {
    if (role === 'boss') {
      if (season <= 2005) return { name: "Peter Sauber", country: "Suíça 🇨🇭", description: "Fundador herói suíço responsável por integrar talentos e manter a equipe competitiva nos anos 90." };
      if (season <= 2022) return { name: "Frédéric Vasseur", country: "França 🇫🇷", description: "Mente política excelente, integrou a marca Alfa Romeo garantindo aporte financeiro e técnico sólido." };
      return { name: "Andreas Seidl", country: "Alemanha 🇩🇪", description: "Diretor geral conceituado focado em construir a ambiciosa transição técnica rumo ao time de fábrica Audi." };
    }
    if (role === 'engineer') {
      if (season <= 2015) return { name: "Willy Rampf", country: "Alemanha 🇩🇪", description: "Diretor técnico focado em chassis rígidos e excelente uso do túnel de vento de Hinwil." };
      return { name: "James Key", country: "Reino Unido 🇬🇧", description: "Diretor técnico renomado encarregado de redesenhar os monoplazas suíços na era pós-híbrida." };
    }
    if (role === 'strategist') {
      if (season >= 2016) return { name: "Ruth Buscombe", country: "Reino Unido 🇬🇧", description: "Estrategista de elite célebre por chamadas arrojadas em clima instável com pneus de seco." };
      return { name: "Beat Zehnder", country: "Suíça 🇨🇭", description: "Gerente de boxe lendário operante desde os anos 90, com imenso conhecimento regulatório da FIA." };
    }
  }

  if (t.includes('jordan')) {
    if (role === 'boss') return { name: "Eddie Jordan", country: "Irlanda 🇮🇪", description: "O pitoresco e carismático irlandês, mestre do marketing e revelador do jovem Schumacher." };
    if (role === 'engineer') return { name: "Gary Anderson", country: "Reino Unido 🇬🇧", description: "Projetista genial do inesquecível bólido verde Jordan 191, famoso pelo refino do chassi das curvas." };
    if (role === 'strategist') return { name: "Richard Cregan", country: "Irlanda 🇮🇪", description: "Membro de box clássico que calibrou as brilhantes e rápidas tomadas de decisão na chuva de Spa 1998." };
  }

  if (t.includes('toro rosso') || t.includes('alphatauri') || t.includes('rb') || t.includes('minardi')) {
    if (role === 'boss') {
      if (season <= 2023) return { name: "Franz Tost", country: "Áustria 🇦🇹", description: "Formador ultra rígido e dedicado dos maiores talentos jovens da academia Red Bull." };
      return { name: "Laurent Mekies", country: "França 🇫🇷", description: "Ex-diretor esportivo da Ferrari contratado para infundir disciplina operacional italiana." };
    }
    if (role === 'engineer') {
      if (season <= 2012) return { name: "Giorgio Ascanelli", country: "Itália 🇮🇹", description: "Ex-engenheiro de Senna, alinhou o chassi STR3 que rendeu a antológica vitória de Vettel em Monza." };
      return { name: "Jody Egginton", country: "Reino Unido 🇬🇧", description: "Diretor de engenharia contemporâneo que foca em extrair refinamento aerodinâmico sob orçamentos enxutos." };
    }
    if (role === 'strategist') {
      return { name: "Marco Matassa", country: "Itália 🇮🇹", description: "Coordenador de pista responsável por calibrar undercuts e paradas rápidas da garagem júnior." };
    }
  }

  if (t.includes('aston') || t.includes('force india') || t.includes('racing point')) {
    if (role === 'boss') {
      if (season <= 2021) return { name: "Otmar Szafnauer", country: "Estados Unidos 🇺🇸", description: "Mestre operacional de boxes ágil, conhecido em extrair o máximo do time sob orçamentos apertados." };
      return { name: "Mike Krack", country: "Luxemburgo 🇱🇺", description: "Líder técnico pragmático alinhando a robusta garagem verde sob os investimentos de Stroll." };
    }
    if (role === 'engineer') {
      if (season <= 2022) return { name: "Andrew Green", country: "Reino Unido 🇬🇧", description: "Projetista astuto que criou carros brilhantemente eficientes nas retas sob o nome Force India." };
      return { name: "Dan Fallows", country: "Reino Unido 🇬🇧", description: "Ex-pupilo de Adrian Newey contratado a peso de ouro para desenhar o audacioso assoalho da Aston Martin." };
    }
    if (role === 'strategist') {
      return { name: "Bernadette Collins", country: "Reino Unido 🇬🇧", description: "Estrategista renomada famosa por leituras agudas de desgaste de pneus nos boxes da equipe." };
    }
  }

  // Fallbacks:
  if (role === 'boss') {
    if (t.includes('toyota')) return { name: "Tsutomu Tomita", country: "Japão 🇯🇵", description: "Líder corporativo japonês que capitaneou o audacioso projeto fabril Toyota na F1." };
    if (t.includes('bar')) return { name: "Craig Pollock", country: "Reino Unido 🇬🇧", description: "Fundador audaz e mestre de negócios da equipe BAR ao lado de Jacques Villeneuve." };
    if (t.includes('ligier')) return { name: "Guy Ligier", country: "França 🇫🇷", description: "O patriota herói francês que fundou e comandou a mítica garagem azul de vitórias memoráveis." };
    if (t.includes('brm')) return { name: "Alfred Owen", country: "Reino Unido 🇬🇧", description: "Presidente audaz britânico que transformou a BRM em marca campeã do mundo nos anos 60." };
    if (t.includes('cooper')) return { name: "John Cooper", country: "Reino Unido 🇬🇧", description: "Pai da revolução do motor traseiro, um dos maiores ícones de engenharia da história." };
    if (t.includes('maserati')) return { name: "Nello Ugolini", country: "Itália 🇮🇹", description: "Grande mestre esportivo clássico dos boxes vencedores de Juan Manuel Fangio nos anos 50." };
    return null;
  }
  if (role === 'engineer') {
    if (t.includes('toyota')) return { name: "Mike Gascoyne", country: "Reino Unido 🇬🇧", description: "Designer respeitado contratado a peso de ouro para trazer rigor aerodinâmico à garagem nipônica." };
    if (t.includes('bar')) return { name: "Malcolm Oastler", country: "Austrália 🇦🇺", description: "Desenhou bólidos robustos impulsionados pelos brutais motores Honda V10." };
    if (t.includes('ligier')) return { name: "Gérard Ducarouge", country: "França 🇫🇷", description: "Desenhou os clássicos bólidos franceses de azul celeste excelentes nas pistas de alta velocidade." };
    if (t.includes('brm')) return { name: "Tony Rudd", country: "Reino Unido 🇬🇧", description: "Mente criativa que desenhou bólidos e motores emblemáticos de corrida da BRM." };
    if (t.includes('cooper')) return { name: "Owen Maddock", country: "Reino Unido 🇬🇧", description: "Pioneiro da aerodinâmica clássica que viabilizou o chassi leve com motor traseiro campeão da Cooper." };
    if (t.includes('maserati')) return { name: "Gioacchino Colombo", country: "Itália 🇮🇹", description: "Lendário engenheiro italiano clássico, pai dos brutais blocos de motor V8 e 6 em linha." };
    return null;
  }
  
  // strategist fallbacks
  if (t.includes('toyota')) return { name: "Dieter Gass", country: "Alemanha 🇩🇪", description: "Coordenador técnico de pista focado em simulações robustas e paradas conservadoras." };
  if (t.includes('bar')) return { name: "Jock Clear", country: "Reino Unido 🇬🇧", description: "Engenheiro de corrida cerebral com imensa leitura tática de pit wall clássico." };
  if (t.includes('ligier')) return { name: "Guy Ligier", country: "França 🇫🇷", description: "Mestre tático autônomo que ditava ordens de pit de forma impetuosa." };
  if (t.includes('cooper') || t.includes('maserati') || t.includes('brm')) {
    return { name: "Guerino Bertocchi", country: "Itália 🇮🇹", description: "Lendário mecânico-chefe e assistente tático de pista clássico da era de ouro dos anos 50." };
  }
  return null;
};

const resolveRealStaff = (teamName: string, season: number, role: 'boss' | 'engineer' | 'strategist', avgRating: number) => {
  const queryTeam = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // 1. Try exact year and team match in PRD_STAFF_RECORDS
  const exactMatches = PRD_STAFF_RECORDS.filter(rec => {
    const recRole = mapRoleType(rec.role_normalized);
    return recRole === role && isTeamMatch(rec.equipe_nome, queryTeam) && rec.ano === season;
  });
  
  if (exactMatches.length > 0) {
    const match = exactMatches[0];
    return {
      name: match.nome,
      country: mapNacionalidade(match.nacionalidade),
      overall: match.overall,
      description: match.observacao || getDefaultDesc(match.nome, teamName, season, role)
    };
  }

  // 2. Try era-appropriate backup database
  const backup = getBackupStaff(teamName, season, role, avgRating);
  if (backup) {
    // Attempt to map back the overall rating if they are in the PRD database under other years
    const prdSameNameMatches = PRD_STAFF_RECORDS.filter(p => p.nome.toLowerCase() === backup.name.toLowerCase());
    let specOverall = avgRating;
    if (prdSameNameMatches.length > 0) {
      const sortedByYearDiff = prdSameNameMatches.sort((a, b) => Math.abs(a.ano - season) - Math.abs(b.ano - season));
      specOverall = sortedByYearDiff[0].overall;
    } else {
      specOverall = Math.max(70, Math.min(99, Math.round(avgRating + (Math.random() * 4 - 2))));
    }
    return {
      name: backup.name,
      country: backup.country,
      overall: specOverall,
      description: backup.description
    };
  }

  // 3. Proximity search in PRD_STAFF_RECORDS for same team & role
  const sameTeamRoleCandidates = PRD_STAFF_RECORDS.filter(rec => {
    const recRole = mapRoleType(rec.role_normalized);
    return recRole === role && isTeamMatch(rec.equipe_nome, queryTeam);
  });

  if (sameTeamRoleCandidates.length > 0) {
    const sorted = sameTeamRoleCandidates.sort((a, b) => Math.abs(a.ano - season) - Math.abs(b.ano - season));
    const match = sorted[0];
    return {
      name: match.nome,
      country: mapNacionalidade(match.nacionalidade),
      overall: match.overall,
      description: match.observacao || getDefaultDesc(match.nome, teamName, season, role)
    };
  }

  // Absolute fallback:
  const roleTypeMap = {
    'boss': ['team_principal'],
    'engineer': ['technical_director', 'chief_designer', 'chief_engineer'],
    'strategist': ['strategy_lead']
  };
  const targetRoleTypes = roleTypeMap[role];
  const allStaffOfRole = PRD_STAFF_RECORDS.filter(p => targetRoleTypes.includes(p.role_normalized));
  
  if (allStaffOfRole.length > 0) {
    const sorted = allStaffOfRole.sort((a, b) => Math.abs(a.ano - season) - Math.abs(b.ano - season));
    const match = sorted[0];
    return {
      name: match.nome,
      country: mapNacionalidade(match.nacionalidade),
      overall: match.overall,
      description: `Originalmente da equipe ${match.equipe_nome} (${match.ano}). Contratado de emergência para atuar pela escuderia ${teamName} na temporada de ${season}. ${match.observacao || ''}`
    };
  }

  return {
    name: role === 'boss' ? `Diretor ${teamName}` : role === 'engineer' ? `Engenheiro ${teamName}` : `Estrategista ${teamName}`,
    country: 'Mundo 🌐',
    overall: avgRating,
    description: `Responsável de alto nível atuando pela escuderia ${teamName} na temporada de ${season}.`
  };
};

const dynamicTeams: TeamCombination[] = [];

// Group raw stats by combination of year and teamName
const groups: Record<string, StatsDriverRaw[]> = {};
(historicalStatsRaw as StatsDriverRaw[]).forEach(row => {
  const key = `${row.year}_${row.teamName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  if (!groups[key]) {
    groups[key] = [];
  }
  groups[key].push(row);
});

// For each group, create a TeamCombination if we don't have it in hardcoded SEASONS_TEAMS
Object.entries(groups).forEach(([groupKey, driversList]) => {
  if (driversList.length === 0) return;
  const first = driversList[0];
  const season = first.year;
  const teamName = first.teamName;
  
  // Skip if we already have this exact combination in the hardcoded SEASONS_TEAMS
  const alreadyExists = HARDCODED_SEASONS_TEAMS.some(t => {
    return t.season === season && (
      t.teamName.toLowerCase() === teamName.toLowerCase() || 
      t.teamId === `${teamName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${season}`
    );
  });
  if (alreadyExists) return;

  // Let's build drivers list
  const teamDrivers = driversList.map(d => {
    const driverId = `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${season}`;
    const rating = Math.max(50, Math.min(99, d.rating_geral));
    return {
      id: driverId,
      name: d.name,
      country: getDriverRealCountryAndFlag(d.name),
      titles: d.pos === '1' ? 1 : 0,
      wins: d.wins,
      podiums: d.podiums,
      poles: d.wins, // approximate poles as wins for historic stats
      rating_geral: rating,
      pace: Math.max(50, Math.min(100, Math.round(rating + (Math.random() * 4 - 2)))),
      consistency: Math.max(50, Math.min(100, Math.round(rating + (Math.random() * 6 - 3)))),
      chuva: Math.max(50, Math.min(100, Math.round(rating + (Math.random() * 8 - 4)))),
      aggressiveness: Math.max(30, Math.min(100, Math.round(70 + (Math.random() * 25 - 12)))),
      reliability: Math.max(50, Math.min(100, Math.round(rating + (Math.random() * 6 - 3)))),
      description: `Piloto titular da equipe ${teamName} disputando a lendária temporada de ${season}. Conquistou a posição final de P${d.pos} com ${d.points} pontos.`
    };
  });

  // Inject real teammates from our database if available
  const dynKey = `${season}_${teamName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  let foundTeammates: TeammateData[] = [];
  
  for (const [dbKey, teammates] of Object.entries(REAL_TEAMMATES_DB)) {
    const dbKeyNorm = dbKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (dynKey === dbKeyNorm || dynKey.includes(dbKeyNorm) || dbKeyNorm.includes(dynKey)) {
      foundTeammates = teammates;
      break;
    }
  }

  // Map and add the real teammates
  foundTeammates.forEach(tm => {
    const baseRating = teamDrivers[0]?.rating_geral || 82;
    const finalRating = Math.max(50, Math.min(99, Math.round(baseRating + (tm.rating_offset || -4))));
    
    // Prevent duplicate entries
    const alreadyIn = teamDrivers.some(d => d.name.toLowerCase() === tm.name.toLowerCase());
    if (alreadyIn) return;

    teamDrivers.push({
      id: `${tm.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${season}`,
      name: tm.name,
      country: tm.country,
      titles: tm.titles,
      wins: tm.wins,
      podiums: tm.podiums,
      poles: tm.poles,
      rating_geral: finalRating,
      pace: Math.max(50, Math.min(100, Math.round(finalRating + (Math.random() * 4 - 2)))),
      consistency: Math.max(50, Math.min(100, Math.round(finalRating + (Math.random() * 6 - 3)))),
      chuva: Math.max(50, Math.min(100, Math.round(finalRating + (Math.random() * 8 - 4)))),
      aggressiveness: Math.max(30, Math.min(100, Math.round(70 + (Math.random() * 25 - 12)))),
      reliability: Math.max(50, Math.min(100, Math.round(finalRating + (Math.random() * 6 - 3)))),
      description: tm.description
    });
  });

  // Calculate average rating to scale personnel stats
  const avgRating = Math.round(teamDrivers.reduce((acc, cr) => acc + cr.rating_geral, 0) / teamDrivers.length) || 75;

  const getDynamicColors = (team: string) => {
    const lower = team.toLowerCase();
    let isRealBrand = false;
    
    // Check if it's a real F1 team
    const realKeywords = [
      'ferrari', 'mclaren', 'mercedes', 'red bull', 'redbull', 'renault', 'williams', 
      'sauber', 'alfa romeo', 'jordan', 'benetton', 'lotus', 'brabham', 'tyrrell', 
      'bwt', 'alpine', 'aston martin', 'toro rosso', 'alphatauri', 'brawn', 'toyota', 
      'bar', 'ligier', 'brm', 'cooper', 'maserati', 'minardi', 'haas', 'force india', 
      'racing point', 'audi'
    ];
    if (realKeywords.some(kw => lower.includes(kw))) {
      isRealBrand = true;
    }

    if (lower.includes('ferrari')) return { logo: 'from-red-600 to-yellow-500', border: 'border-red-600', text: 'text-red-500', isRealBrand };
    if (lower.includes('mclaren')) return { logo: 'from-orange-500 to-neutral-900', border: 'border-orange-500', text: 'text-orange-500', isRealBrand };
    if (lower.includes('mercedes')) return { logo: 'from-cyan-400 to-zinc-400', border: 'border-cyan-400', text: 'text-cyan-400', isRealBrand };
    if (lower.includes('red bull') || lower.includes('redbull')) return { logo: 'from-blue-900 to-yellow-400', border: 'border-blue-700', text: 'text-blue-500', isRealBrand };
    if (lower.includes('renault')) return { logo: 'from-yellow-400 to-black', border: 'border-yellow-400', text: 'text-yellow-400', isRealBrand };
    if (lower.includes('williams')) return { logo: 'from-blue-600 to-white', border: 'border-blue-600', text: 'text-blue-600', isRealBrand };
    if (lower.includes('sauber') || lower.includes('alfa romeo')) return { logo: 'from-red-700 to-white', border: 'border-red-700', text: 'text-red-700', isRealBrand };
    if (lower.includes('jordan')) return { logo: 'from-yellow-300 to-black', border: 'border-yellow-400', text: 'text-yellow-400', isRealBrand };
    if (lower.includes('benetton')) return { logo: 'from-emerald-500 to-sky-400', border: 'border-emerald-500', text: 'text-emerald-500', isRealBrand };
    if (lower.includes('lotus')) return { logo: 'from-emerald-800 to-yellow-400', border: 'border-emerald-700', text: 'text-emerald-500', isRealBrand };
    if (lower.includes('brabham')) return { logo: 'from-blue-800 to-yellow-400', border: 'border-blue-800', text: 'text-blue-500', isRealBrand };
    if (lower.includes('tyrrell')) return { logo: 'from-blue-900 to-white', border: 'border-blue-900', text: 'text-blue-600', isRealBrand };
    if (lower.includes('bwt') || lower.includes('alpine') || lower.includes('aston martin')) return { logo: 'from-emerald-900 to-black', border: 'border-emerald-800', text: 'text-emerald-600', isRealBrand };
    if (lower.includes('toyota')) return { logo: 'from-red-600 to-white', border: 'border-red-500', text: 'text-red-600', isRealBrand };
    if (lower.includes('bar')) return { logo: 'from-emerald-950 to-white', border: 'border-emerald-900', text: 'text-green-700', isRealBrand };
    if (lower.includes('ligier')) return { logo: 'from-blue-800 to-white', border: 'border-blue-700', text: 'text-blue-600', isRealBrand };
    if (lower.includes('force india')) return { logo: 'from-orange-500 to-emerald-500', border: 'border-emerald-500', text: 'text-orange-500', isRealBrand };
    
    return { logo: 'from-slate-800 to-zinc-900', border: 'border-gray-800', text: 'text-gray-400', isRealBrand };
  };

  const { logo, border, text, isRealBrand } = getDynamicColors(teamName);

  // Maintain only verified real F1 teams
  if (!isRealBrand) return;

  // Resolve authentic staff data
  const realBoss = resolveRealStaff(teamName, season, 'boss', avgRating);
  const realStrategist = resolveRealStaff(teamName, season, 'strategist', avgRating);
  const realEngineer = resolveRealStaff(teamName, season, 'engineer', avgRating);

  dynamicTeams.push({
    season,
    teamId: `${teamName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${season}`,
    teamName,
    logoColor: logo,
    borderColor: border,
    textColor: text,
    drivers: teamDrivers,
    boss: {
      id: `boss_${groupKey}`,
      name: realBoss.name,
      country: realBoss.country,
      rating_geral: realBoss.overall,
      leadership: Math.max(50, Math.min(100, Math.round(realBoss.overall + (Math.random() * 4 - 2)))),
      pressure_handling: Math.max(50, Math.min(100, Math.round(realBoss.overall + (Math.random() * 6 - 3)))),
      prestige: Math.max(50, Math.min(100, Math.round(realBoss.overall + (Math.random() * 4 - 2)))),
      description: realBoss.description
    },
    chassis: {
      id: `chassis_${groupKey}`,
      name: `${teamName} C-${season}`,
      engine: `${teamName} PowerUnit`,
      rating_geral: Math.max(50, Math.min(105, Math.round(avgRating + (Math.random() * 6 - 3)))),
      top_speed: Math.max(50, Math.min(100, Math.round(avgRating + (Math.random() * 8 - 4)))),
      aerodynamics: Math.max(50, Math.min(100, Math.round(avgRating + (Math.random() * 8 - 4)))),
      conducao: Math.max(50, Math.min(100, Math.round(avgRating + (Math.random() * 6 - 3)))),
      reliability: Math.max(50, Math.min(100, Math.round(avgRating + (Math.random() * 10 - 5)))),
      description: `Modelo oficial de chassi aerodinamicamente moldado para a performance da escuderia ${teamName} em ${season}.`
    },
    strategist: {
      id: `strategist_${groupKey}`,
      name: realStrategist.name,
      rating_geral: realStrategist.overall,
      calculated_risk: Math.round(40 + Math.random() * 50),
      pit_tactics: Math.max(50, Math.min(100, Math.round(realStrategist.overall + (Math.random() * 4 - 2)))),
      reactivity: Math.max(50, Math.min(100, Math.round(realStrategist.overall + (Math.random() * 6 - 3)))),
      description: realStrategist.description
    },
    engineer: {
      id: `engineer_${groupKey}`,
      name: realEngineer.name,
      rating_geral: realEngineer.overall,
      aerodynamics: Math.max(50, Math.min(100, Math.round(realEngineer.overall + (Math.random() * 6 - 3)))),
      innovation: Math.max(50, Math.min(100, Math.round(realEngineer.overall + (Math.random() * 8 - 4)))),
      weight_saving: Math.max(50, Math.min(100, Math.round(realEngineer.overall + (Math.random() * 4 - 2)))),
      description: realEngineer.description
    },
    isWorst: avgRating < 75
  });
});

export const SEASONS_TEAMS: TeamCombination[] = [...HARDCODED_SEASONS_TEAMS, ...dynamicTeams];

export function getRandomComboExcept(excludeIds: string[], onlyWorst: boolean = false): TeamCombination {
  let filteredPool = SEASONS_TEAMS.filter(item => onlyWorst ? item.isWorst === true : !item.isWorst);
  // Fallback in case pool is empty
  if (filteredPool.length === 0) {
    filteredPool = SEASONS_TEAMS;
  }
  const available = filteredPool.filter(item => !excludeIds.includes(item.teamId));
  const pool = available.length > 0 ? available : filteredPool;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function evaluateQualityRank(avgRating: number): {
  rank: string;
  color: string;
} {
  if (avgRating >= 96) return { rank: 'Lendária', color: 'text-amber-400 border-amber-400 bg-amber-950/40' };
  if (avgRating >= 91) return { rank: 'Ouro', color: 'text-yellow-500 border-yellow-500 bg-yellow-950/20' };
  if (avgRating >= 84) return { rank: 'Prata', color: 'text-slate-300 border-slate-300 bg-slate-900/40' };
  if (avgRating >= 78) return { rank: 'Bronze', color: 'text-orange-500 border-orange-500 bg-orange-950/20' };
  return { rank: 'Underdog Humilde', color: 'text-[#FF1801] border-[#FF1801]/30 bg-red-950/20' };
}

export function detectCombos(filledSlots: Record<string, any>): { name: string; description: string; bonusValue: number; icon: string }[] {
  const combos: { name: string; description: string; bonusValue: number; icon: string }[] = [];
  const drivers: any[] = [
    filledSlots['driver_1'],
    filledSlots['driver_2'],
    filledSlots['reserve_1'],
  ].filter(Boolean);

  const chassis = filledSlots['chassis'];
  const boss = filledSlots['team_boss'];
  const strategist = filledSlots['strategist'];
  const engineer = filledSlots['engineer'];

  // Check for Ayrton Senna + McLaren
  const hasSenna = drivers.some(d => d.name.includes('Senna'));
  const hasMcLarenChassis = chassis && chassis.name.includes('McLaren');
  if (hasSenna && hasMcLarenChassis) {
    combos.push({
      name: 'Senna & McLaren',
      description: 'O casamento perfeito que dominou o planeta em 1988. Sinergia espiritual fantástica (+5 Pace, +3 Confiabilidade).',
      bonusValue: 8,
      icon: 'sparkleCount'
    });
  }

  // Michael Schumacher + Ferrari Chassis or Jean Todt
  const hasSchumy = drivers.some(d => d.name.includes('Schumacher'));
  const hasFerrariChassis = chassis && chassis.name.includes('Ferrari');
  const hasJeanTodt = boss && boss.name.includes('Jean Todt');
  if (hasSchumy && (hasFerrariChassis || hasJeanTodt)) {
    combos.push({
      name: 'Era de Ouro Maranello',
      description: 'Schumacher e o comando estratégico italiano. A inabalável força do rolo compressor (+6 Consistência, +4 Confiabilidade).',
      bonusValue: 10,
      icon: 'flag'
    });
  }

  // Adrian Newey + Williams/Red Bull Chassis
  const hasNewey = engineer && engineer.name.includes('Adrian Newey');
  const hasChassisForNewey = chassis && (chassis.name.includes('Red Bull') || chassis.name.includes('Williams'));
  if (hasNewey && hasChassisForNewey) {
    combos.push({
      name: 'Gênio Aerodinâmico',
      description: 'Adrian Newey desenhando um foguete que realmente decola no túnel de vento (+8 Aerodinâmica).',
      bonusValue: 9,
      icon: 'wind'
    });
  }

  // Lewis Hamilton + Mercedes Chassis
  const hasHamilton = drivers.some(d => d.name.includes('Hamilton'));
  const hasMercedesChassis = chassis && chassis.name.includes('Mercedes');
  if (hasHamilton && hasMercedesChassis) {
    combos.push({
      name: 'Sexteto Prateado',
      description: 'A parceria Hamilton-Mercedes ativa o modo martelo. Ritmo avassalador em qualquer circuito (+5 Pace).',
      bonusValue: 7,
      icon: 'zap'
    });
  }

  // Hannah Schmitz + Red Bull Chassis/Boss Horner
  const hasHannah = strategist && strategist.name.includes('Hannah Schmitz');
  const hasRedBullHornerOrCar = (chassis && chassis.name.includes('Red Bull')) || (boss && boss.name.includes('Horner'));
  if (hasHannah && hasRedBullHornerOrCar) {
    combos.push({
      name: 'Estratégia Imparável',
      description: 'Hannah Schmitz orquestrando pit stops na milésima de segundo para desestabilizar os adversários (+8 Estratégia).',
      bonusValue: 8,
      icon: 'brain'
    });
  }

  // Double Brazilian drivers inside team
  const brazilians = drivers.filter(d => d.country.includes('Brasil')).length;
  if (brazilians >= 2) {
    combos.push({
      name: 'Garra Brasileira 🇧🇷',
      description: 'Dois pilotos do país do samba. Samba e agressividade pura nas curvas molhadas (+6 Chuva para o time!).',
      bonusValue: 6,
      icon: 'heart'
    });
  }

  // High aggressiveness drivers conflict
  const aggLevel = drivers.reduce((acc, d) => acc + (d.aggressiveness || 80), 0) / (drivers.length || 1);
  if (aggLevel > 92) {
    combos.push({
      name: 'Box Explosivo 💥',
      description: 'Muitos elementos altamente agressivos! Risco sério de batidas entre companheiros nos boxes (-2 Confiabilidade).',
      bonusValue: -4,
      icon: 'flame'
    });
  }

  // Binotto / Inaki Rueda drama
  const hasBinotto = boss && boss.name.includes('Binotto');
  const hasRueda = strategist && strategist.name.includes('Inaki');
  if (hasBinotto && hasRueda) {
    combos.push({
      name: 'Desastre Tático',
      description: 'O temível combo de pneus duros em dia de tempestade na Hungria. Deus nos ajude (-10 Estratégia).',
      bonusValue: -12,
      icon: 'alert-triangle'
    });
  }

  // Senna & Prost Cockpit War
  const hasProst = drivers.some(d => d.name.includes('Prost'));
  if (hasSenna && hasProst) {
    combos.push({
      name: 'Senna & Prost - Guerra de Box 🚨',
      description: 'Extrema rivalidade mútua. A obsessão de derrotar o companheiro eleva o ritmo de classificação ao limite (+12 Pace), mas racha o box e derruba a confiabilidade do carro (-15 Confiabilidade) com stress severo.',
      bonusValue: 6,
      icon: 'shield-alert'
    });
  }

  // Alonso & Hamilton Cockpit Clash
  const hasAlonso = drivers.some(d => d.name.includes('Alonso'));
  if (hasAlonso && hasHamilton) {
    combos.push({
      name: 'Alonso & Hamilton - Fogo Cruzado 💥',
      description: 'A rivalidade estrondosa da McLaren 2007 ganha nova vida! Ambos empurram um ao outro a patamares fenomenais (+8 Pace), mas a guerra psicológica detona a confiabilidade (-10 Confiabilidade).',
      bonusValue: 4,
      icon: 'zap'
    });
  }

  // Vettel + Red Bull Legacy
  const hasVettel = drivers.some(d => d.name.includes('Vettel'));
  const hasRedBullChassis = chassis && chassis.name.includes('Red Bull');
  if (hasVettel && hasRedBullChassis) {
    combos.push({
      name: 'Touro de Ouro: Vettel & Red Bull 🐂',
      description: 'O tetracampeonato consecutivo ressurge em Milton Keynes. Sintonização perfeita em curvas rápidas (+8 Ritmo, +4 Direção térmica).',
      bonusValue: 10,
      icon: 'sparkle'
    });
  }

  // Jordan -> Aston Martin lineage
  const hasEddieJordan = boss && boss.name.includes('Eddie Jordan');
  const hasAstonChassis = chassis && chassis.name.includes('Aston Martin');
  if (hasEddieJordan && hasAstonChassis) {
    combos.push({
      name: 'DNA Jordan -> Aston Martin 🏎️',
      description: 'O carismático Eddie Jordan retorna ao comando de sua antiga equipe de Silverstone (Jordan GP), hoje rebatizada de Aston Martin. Nostalgia histórica de ouro (+6 Consistência).',
      bonusValue: 7,
      icon: 'landmark'
    });
  }

  // Engine / Power Unit synergies
  const engine = filledSlots['engine'];
  if (engine) {
    const engineBrand = engine.brand?.toLowerCase() || '';
    const chassisName = chassis?.name?.toLowerCase() || '';
    
    // Ferrari chassis + Ferrari engine
    if (engineBrand === 'ferrari' && chassisName.includes('ferrari')) {
      combos.push({
        name: 'Compatibilidade Cavallino 🐎',
        description: 'Chassi Ferrari combinado com o legítimo motor de Maranello. Harmonia técnica absoluta (+5 Confiabilidade, +4 Ritmo).',
        bonusValue: 8,
        icon: 'trophy'
      });
    }
    // Mercedes chassis + Mercedes engine
    if (engineBrand === 'mercedes' && chassisName.includes('mercedes')) {
      combos.push({
        name: 'Sinergia Flechas de Prata ⚡',
        description: 'Chassi e motor integrados perfeitamente pelo departamento de Brixworth e Brackley (+6 Potência/Ritmo).',
        bonusValue: 8,
        icon: 'zap'
      });
    }
    // McLaren chassis + Honda engine
    if (engineBrand === 'honda' && chassisName.includes('mclaren')) {
      combos.push({
        name: 'Aliança Lendária McLaren-Honda 🏆',
        description: 'Recriando um dos maiores domínios da F1, unindo chassi McLaren ao torque explosivo da Honda (+7 Ritmo, +5 Confiabilidade).',
        bonusValue: 10,
        icon: 'sparkles'
      });
    }
    // Meme engines effects
    if (engine.tier === 'meme') {
      combos.push({
        name: 'Motor Explosivo de Fundo de Grid 💥',
        description: 'O motor escolhido é um desastre lendário. Boa sorte sobrevivendo à temporada! (-12 Confiabilidade, -8 Velocidade).',
        bonusValue: -15,
        icon: 'frown'
      });
    }
  }

  return combos;
}
