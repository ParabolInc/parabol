import {R} from 'rethinkdb-ts'
import {PALETTE} from 'parabol-client/styles/paletteV3'

const oldColors = [
  '#5CA0E5', // PROMPT_BLUE
  '#45E595', // PROMPT_CYAN
  '#E55CA0', // PROMPT_FUCHSIA
  '#52CC52', // PROMPT_GREEN
  '#45E5E5', // PROMPT_LIGHT_BLUE
  '#7EE517', // PROMPT_LIGHT_GREEN
  '#E59545', // PROMPT_ORANGE
  '#E573E5', // PROMPT_PINK
  '#7373E5', // PROMPT_PURPLE
  '#E55C5C', // PROMPT_RED
  '#AC73E5', // PROMPT_VIOLET
  '#E5E500', // PROMPT_YELLOW
  '#D9D916' // older PROMPT_YELLOW
]

const newColors = [
  PALETTE.SKY_500, // replaces PROMPT_BLUE
  PALETTE.AQUA_400, // replaces PROMPT_CYAN and PROMPT_LIGHT_BLUE
  PALETTE.FUSCIA_400, // replaces PROMPT_FUCHSIA
  PALETTE.JADE_400, // replaces PROMPT_GREEN
  PALETTE.AQUA_400, // replaces PROMPT_LIGHT_BLUE and PROMPT_CYAN
  PALETTE.GRASS_300, // replaces PROMPT_LIGHT_GREEN
  PALETTE.TERRA_300, // replaces PROMPT_ORANGE
  PALETTE.ROSE_500, // replaces PROMPT_PINK
  PALETTE.LILAC_500, // replaces PROMPT_PURPLE
  PALETTE.TOMATO_500, // replaces PROMPT_RED
  PALETTE.GRAPE_500, // replaces PROMPT_VIOLET
  PALETTE.GOLD_300, // replaces PROMPT_YELLOW
  PALETTE.GOLD_300 // replaces older PROMPT_YELLOW
]

export const up = async function(r: R) {
  try {
    await Promise.all(
      oldColors.map((oldColor, idx) => {
        return r
          .table('ReflectPrompt')
          .filter({removedAt: null})
          .filter({groupColor: oldColor})
          .update({
            groupColor: newColors[idx]
          })
          .run()
      })
    )
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await Promise.all(
      newColors.map((newColor, idx) => {
        return r
          .table('ReflectPrompt')
          .filter({removedAt: null})
          .filter({groupColor: newColor})
          .update({
            groupColor: oldColors[idx]
          })
          .run()
      })
    )
  } catch (e) {
    console.log(e)
  }
}
