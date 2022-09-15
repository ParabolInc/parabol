import {R} from 'rethinkdb-ts'
import {PALETTE} from '../../../client/styles/paletteV3'

export const up = async function (r: R) {
  try {
    await r({
      houseOfBricks: r
        .table('ReflectPrompt')
        .get('promptHouseOfBricks')
        .update({groupColor: PALETTE.JADE_400}),
      houseOfSticks: r
        .table('ReflectPrompt')
        .get('promptHouseOfSticks')
        .update({groupColor: PALETTE.TOMATO_700}),
      houseOfStraw: r
        .table('ReflectPrompt')
        .get('promptHouseOfStraw')
        .update({groupColor: PALETTE.GOLD_300})
    }).run()
  } catch (e) {
    console.error('error when migration up groupColors for the threeLittlePigsTemplate', e)
  }
}

export const down = async function (r: R) {
  try {
    await r({
      houseOfBricks: r
        .table('ReflectPrompt')
        .get('promptHouseOfBricks')
        .update({groupColor: '#D9D916'}),
      houseOfSticks: r
        .table('ReflectPrompt')
        .get('promptHouseOfSticks')
        .update({groupColor: '#E55C5C'}),
      houseOfStraw: r
        .table('ReflectPrompt')
        .get('promptHouseOfStraw')
        .update({groupColor: '#52CC52'})
    }).run()
  } catch (e) {
    console.error('error when migrating down groupColors for the threeLittlePigsTemplate', e)
  }
}
