import {PALETTE} from 'parabol-client/styles/paletteV3'
import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  const questions = [
    'Glad',
    'Sad',
    'Mad',
    'Liked',
    'Learned',
    'Lacked',
    'Longed for',
    'Wind in the sails',
    'Anchors',
    'Risks',
    'Start',
    'Stop',
    'Continue',
    'What’s working?',
    'Where did you get stuck?'
  ]
  const questionColors = [
    PALETTE.PROMPT_GREEN,
    PALETTE.PROMPT_BLUE,
    PALETTE.PROMPT_RED,
    PALETTE.PROMPT_GREEN,
    PALETTE.PROMPT_BLUE,
    PALETTE.PROMPT_ORANGE,
    PALETTE.PROMPT_VIOLET,
    PALETTE.PROMPT_GREEN,
    PALETTE.PROMPT_BLUE,
    PALETTE.PROMPT_RED,
    PALETTE.PROMPT_GREEN,
    PALETTE.PROMPT_RED,
    PALETTE.PROMPT_BLUE,
    PALETTE.PROMPT_GREEN,
    PALETTE.PROMPT_RED
  ]

  const allColors = [
    PALETTE.PROMPT_GREEN,
    PALETTE.PROMPT_YELLOW,
    PALETTE.PROMPT_ORANGE,
    PALETTE.PROMPT_RED,
    PALETTE.PROMPT_BLUE,
    PALETTE.PROMPT_CYAN,
    PALETTE.PROMPT_VIOLET,
    PALETTE.PROMPT_PINK,
    PALETTE.PROMPT_LIGHT_BLUE,
    PALETTE.PROMPT_LIGHT_GREEN,
    PALETTE.PROMPT_PURPLE,
    PALETTE.PROMPT_FUCHSIA
  ]

  try {
    await Promise.all(
      questions.map((question, idx) => {
        return r
          .table('CustomPhaseItem')
          .filter({question})
          .update({
            groupColor: questionColors[idx]
          })
          .run()
      })
    )
  } catch (e) {
    console.log(e)
  }
  try {
    const colorlessItemGroups = (await r
      .table('CustomPhaseItem')
      .filter((row) => row('groupColor').default(null).eq(null))
      .group('templateId')('id')
      .ungroup()('reduction')
      .run()) as string[][]

    const updates = [] as {id: string; color: string}[]
    colorlessItemGroups.forEach((items) => {
      items.forEach((itemId, idx) => {
        updates.push({id: itemId, color: allColors[idx]})
      })
    })
    await r(updates)
      .forEach((update) => {
        return r
          .table('CustomPhaseItem')
          .get(update('id'))
          .update({
            color: update('color')
          })
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('CustomPhaseItem')
      .replace((row) => row.without('groupColor'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
