import {R} from 'rethinkdb-ts'

const createdAt = new Date('2020-09-14')

const oldScales = [
  {
    id: 'fibonacciScale',
    createdAt,
    updatedAt: createdAt,
    name: 'Fibonacci',
    values: ['1', '2', '3', '5', '8', '13', '21', '34'],
    teamId: 'aGhostTeam'
  },
  {
    id: 'tshirtSizeScale',
    createdAt,
    updatedAt: createdAt,
    name: 'T-Shirt Sizes',
    values: ['XS', 'SM', 'M', 'L', 'XL'],
    teamId: 'aGhostTeam'
  },
  {
    id: 'fiveFingersScale',
    createdAt,
    updatedAt: createdAt,
    name: 'Five Fingers',
    values: ['1', '2', '3', '4', '5'],
    teamId: 'aGhostTeam'
  }
]

const newScales = [
  {
    id: 'fibonacciScale',
    createdAt,
    updatedAt: createdAt,
    name: 'Fibonacci',
    values: [
      {color: '#5CA0E5', label: '1', value: 1},
      {color: '#5CA0E5', label: '2', value: 2},
      {color: '#45E595', label: '3', value: 3},
      {color: '#45E595', label: '5', value: 5},
      {color: '#45E595', label: '8', value: 8},
      {color: '#E59545', label: '13', value: 13},
      {color: '#E59545', label: '21', value: 21},
      {color: '#E59545', label: '34', value: 34}
    ],
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate'
  },
  {
    id: 'tshirtSizeScale',
    createdAt,
    updatedAt: createdAt,
    name: 'T-Shirt Sizes',
    values: [
      {color: '#5CA0E5', label: 'XS', value: 1},
      {color: '#5CA0E5', label: 'SM', value: 2},
      {color: '#45E595', label: 'M', value: 3},
      {color: '#E59545', label: 'L', value: 4},
      {color: '#E59545', label: 'XL', value: 5}
    ],
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate'
  },
  {
    id: 'fiveFingersScale',
    createdAt,
    updatedAt: createdAt,
    name: 'Five Fingers',
    values: [
      {color: '#5CA0E5', label: '1', value: 1},
      {color: '#5CA0E5', label: '2', value: 2},
      {color: '#45E595', label: '3', value: 3},
      {color: '#E59545', label: '4', value: 4},
      {color: '#E59545', label: '5', value: 5}
    ],
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate'
  }
]

export const up = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .delete()
      .run()
    await r
      .table('TemplateScale')
      .insert(newScales)
      .run()
    await r
      .table('TemplateDimension')
      .indexCreate('teamId')
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .delete()
      .run()
    await r
      .table('TemplateScale')
      .insert(oldScales)
      .run()
    await r
      .table('TemplateDimension')
      .indexDrop('teamId')
      .run()
  } catch (e) {
    console.log(e)
  }
}
