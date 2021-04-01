import {R} from 'rethinkdb-ts'

const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1
const priorityScaleId = 'priorityScale'
const priorityScale = [
  {
    id: priorityScaleId,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Priorities',
    isStarter: true,
    sortOrder: 0,
    values: [
      {color: '#E55CA0', label: '?'},
      {color: '#5CA0E5', label: 'P0'},
      {color: '#5CA0E5', label: 'P1'},
      {color: '#45E595', label: 'P2'},
      {color: '#45E595', label: 'P3'},
      {color: '#E59545', label: 'P4'},
      {color: '#E59545', label: 'P5'},
      {color: '#AC72E5', label: 'Pass'}
    ],
    teamId: 'aGhostTeam'
  }
]

export const up = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .insert(priorityScale)
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .get(priorityScaleId)
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}
