// Note: Not all weight variants of the expanded palette are available.
//       We only add variables when new variants are used in design.
//       As a design choice, we use constraint when adding weights from the expanded palette.
//       We try to only use the limited palette, but weighted variants
//       can help with subtle color changes in states like hover, or disabled.
//       The limited palette is here:
//       https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A366
//       The expanded palette is here:
//       https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A2184

const colors = {
  transparent: 'transparent',
  inherit: 'inherit',
  current: 'currentColor',
  black: '#000',
  white: '#fff',
  primary: '#493272',
  tomato: {
    '100': '#FFE2E0',
    '200': '#FFC1BD',
    '300': '#FEA09A',
    '400': '#FD7F77',
    '500': '#FD6157',
    '600': '#F23B31',
    '700': '#D5211A',
    '800': '#9F201E',
    '900': '#6D1D1D'
  },
  terra: {
    '100': '#FEDCCD',
    '200': '#FFB89C',
    '300': '#FE975D',
    '400': '#D28963',
    '500': '#D35D22',
    '600': '#A34F25',
    '700': '#823917',
    '800': '#501F08',
    '900': '#3A1404'
  },
  gold: {
    '100': '#FAEBD3',
    '200': '#FADC9E',
    '300': '#FFCC63',
    '400': '#FBB337',
    '500': '#DE8E02',
    '600': '#A36200',
    '700': '#855000',
    '800': '#703C00',
    '900': '#522C00'
  },
  grass: {
    '100': '#ECF1A7',
    '200': '#DEE58A',
    '300': '#C4CF66',
    '400': '#BECF3F',
    '500': '#ACC125',
    '600': '#91A617',
    '700': '#73880C',
    '800': '#556704',
    '900': '#354200'
  },
  forest: {
    '100': '#E3F7D4',
    '200': '#C8EBAD',
    '300': '#9EC87E',
    '400': '#73A153',
    '500': '#639442',
    '600': '#528433',
    '700': '#427326',
    '800': '#335F1B',
    '900': '#244A11'
  },
  jade: {
    '100': '#CFF2DE',
    '200': '#ABEDC8',
    '300': '#91E8B7',
    '400': '#66BC8C',
    '500': '#40B574',
    '600': '#2D9F5F',
    '700': '#1D8647',
    '800': '#116931',
    '900': '#08491E'
  },
  aqua: {
    '100': '#CBECF0',
    '200': '#A4DEE5',
    '300': '#7CCFD9',
    '400': '#55C0CF',
    '500': '#33B1C7',
    '600': '#2792AA',
    '700': '#1C748D',
    '800': '#12566D',
    '900': '#0A3A4C'
  },
  sky: {
    '100': '#E8F4FC',
    '200': '#BBDDF7',
    '300': '#8EC7F1',
    '400': '#61B1EB',
    '500': '#329AE5',
    '600': '#14649E',
    '700': '#0F4A76',
    '800': '#0A314D',
    '900': '#051A29'
  },
  lilac: {
    '100': '#EEEDF7',
    '200': '#D4D2EF',
    '300': '#B7B4E9',
    '400': '#9694E6',
    '500': '#7272E5',
    '600': '#5454E3',
    '700': '#3333CC',
    '800': '#2121AB',
    '900': '#1A1A7F'
  },
  grape: {
    '100': '#BD6BD6',
    '200': '#B66BD6',
    '300': '#AF6BD6',
    '400': '#A86BD6',
    '500': '#A06BD6',
    '600': '#7340B5',
    '700': '#493272',
    '800': '#2D1D53',
    '900': '#170F34'
  },
  fuscia: {
    '100': '#EDD5F1',
    '200': '#E4B5E8',
    '300': '#DE94E1',
    '400': '#DB70DB',
    '500': '#D345CF',
    '600': '#BC29B2',
    '700': '#941E88',
    '800': '#6B1460',
    '900': '#410B38'
  },
  rose: {
    '100': '#F9E2ED',
    '200': '#F4BED7',
    '300': '#F099BF',
    '400': '#EE72A4',
    '500': '#ED4C86',
    '600': '#EB195F',
    '700': '#C20F45',
    '800': '#95092F',
    '900': '#66051C'
  },
  slate: {
    '100': '#F8F7FC',
    '200': '#F1F0FA',
    '300': '#E0DDEC',
    '400': '#C3C0D8',
    '500': '#A7A3C2',
    '600': '#82809A',
    '700': '#444258',
    '800': '#2D2D39',
    '900': '#1C1C21'
  },
  'success-light': '#2db553',
  starter: '#F2E1F7',
  team: '#CBECF0',
  enterprise: '#FFE2E0'
}

export const PALETTE = {
  AQUA_400: colors.aqua[400],

  FOREST_400: colors.forest[400],

  FUSCIA_400: colors.fuscia[400],
  GOLD_100: colors.gold[100],
  GOLD_200: colors.gold[200],
  GOLD_300: colors.gold[300],
  GOLD_500: colors.gold[500],
  GOLD_700: colors.gold[700],
  GOLD_HIGHLIGHT: colors.gold[500],

  GRADIENT_TOMATO_600_ROSE_500: `linear-gradient(to right, ${colors.tomato[600]} 0, ${colors.rose[500]} 100%)`, // default: TOMATO_600 to ROSE_500
  GRADIENT_TOMATO_700_ROSE_600: `linear-gradient(to right, ${colors.tomato[700]} 0, ${colors.rose[600]} 100%)`, // hover: TOMATO_700 to ROSE_600
  GRADIENT_TOMATO_400_ROSE_300: `linear-gradient(to right, ${colors.tomato[400]} 0, ${colors.rose[300]} 100%)`, // disabled: TOMATO_400 to ROSE_300

  GRAPE_500_30: `${colors.grape[500]}4D`,

  GRAPE_500: colors.grape[500],
  GRAPE_600: colors.grape[600],
  GRAPE_700: colors.grape[700],
  GRAPE_800: colors.grape[800],

  GRASS_300: colors.grass[300],

  JADE_400_30: `${colors.jade[400]}4D`,

  JADE_500: colors.jade[500],
  JADE_400: colors.jade[400],
  JADE_300: colors.jade[300],

  LILAC_500: colors.lilac[500],

  ROSE_500: colors.rose[500],

  SKY_300: colors.sky[300],
  SKY_400: colors.sky[400],
  SKY_500: colors.sky[500],
  SKY_600: colors.sky[600],

  SKY_500_30: `${colors.sky[500]}4D`,

  SLATE_100: colors.slate[100],
  SLATE_200: colors.slate[200],
  SLATE_300: colors.slate[300],
  SLATE_400: colors.slate[400],
  SLATE_500: colors.slate[500],
  SLATE_600: colors.slate[600],
  SLATE_700: colors.slate[700],
  SLATE_800: colors.slate[800],
  SLATE_900: colors.slate[900],

  SLATE_700_30: `${colors.slate[700]}4D`, // SLATE_700 at 30% opacity
  SLATE_700_80: `${colors.slate[700]}CD`, // SLATE_700 at ~80% opacity
  SLATE_900_32: `${colors.slate[900]}52`, // SLATE_900 at 32% opacity

  TERRA_300: colors.terra[300],
  TERRA_500: colors.terra[500],

  TOMATO_100: colors.tomato[100],
  TOMATO_200: colors.tomato[200],
  TOMATO_400: colors.tomato[400],
  TOMATO_500: colors.tomato[500],
  TOMATO_600: colors.tomato[600],
  TOMATO_700: colors.tomato[700],
  TOMATO_800: colors.tomato[800],

  WHITE: colors.white,

  SUCCESS_LIGHT: '#2db553',

  STARTER: '#F2E1F7',
  TEAM: '#CBECF0',
  ENTERPRISE: '#FFE2E0'
} as const
