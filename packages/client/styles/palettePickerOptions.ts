import {PALETTE} from './paletteV2'

const palettePickerOptions = [
  {
    name: 'Radical raspberry',
    hex: PALETTE.PROMPT_RED
  },
  {
    name: 'Orangecicle in summer',
    hex: PALETTE.PROMPT_ORANGE
  },
  {
    name: 'Buttered pineapple',
    hex: PALETTE.PROMPT_YELLOW
  },
  {
    name: 'Zesty limón',
    hex: PALETTE.PROMPT_LIGHT_GREEN
  },
  {
    name: 'Avocado hold the toast',
    hex: PALETTE.PROMPT_GREEN
  },
  {
    name: 'Dinner mint delight',
    hex: PALETTE.PROMPT_CYAN
  },
  {
    name: 'Arctic breeze on ice',
    hex: PALETTE.PROMPT_LIGHT_BLUE
  },
  {
    name: 'blue.',
    hex: PALETTE.PROMPT_BLUE
  },
  {
    name: 'Blueberry-stained fingers',
    hex: PALETTE.PROMPT_PURPLE
  },
  {
    name: 'Grape jelly',
    hex: PALETTE.PROMPT_VIOLET
  },
  {
    name: 'Pink lemonade powder',
    hex: PALETTE.PROMPT_FUCHSIA
  },
  {
    name: 'Too-pink health drink',
    hex: PALETTE.PROMPT_PINK
  }
] as {name: string; hex: string}[]
export default palettePickerOptions
