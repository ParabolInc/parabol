// Note: Not all weight variants of the expanded palette are available.
//       We only add variables when new variants are used in design.
//       As a design choice, we use constraint when adding weights from the expanded palette.
//       We try to only use the limited palette, but weighted variants
//       can help with subtle color changes in states like hover, or disabled.
//       The limited palette is here:
//       https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A366
//       The expanded palette is here:
//       https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A2184

import tailwindPreset from '../tailwindTheme'

const {colors} = tailwindPreset.theme

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
