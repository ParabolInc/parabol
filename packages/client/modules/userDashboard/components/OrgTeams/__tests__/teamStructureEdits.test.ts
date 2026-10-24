import {
  addValue,
  moveLevel,
  removeValue,
  renameLevel,
  type TeamStructureLevelData,
  toTeamStructureInput
} from '../teamStructureEdits'
import {toTeamStructureRollup} from '../teamStructureRollup'

const LEVELS: TeamStructureLevelData[] = [
  {
    id: 'unit',
    name: 'Business unit',
    values: [
      {id: 'platform', name: 'Platform', teamIds: ['apollo', 'borealis']},
      {id: 'custody', name: 'Custody', teamIds: ['cygnus']}
    ]
  },
  {
    id: 'region',
    name: 'Region',
    values: [{id: 'americas', name: 'Americas', teamIds: ['apollo']}]
  }
]

test('edits find levels and values by id, so they apply to whatever was saved last', () => {
  const edit = (levels: TeamStructureLevelData[]) =>
    renameLevel('unit', 'Division')(addValue('unit', 'Trading')(toTeamStructureInput(levels)))
  const [division] = edit([...LEVELS].reverse()).filter(({id}) => id === 'unit')
  expect(division).toEqual({
    id: 'unit',
    name: 'Division',
    values: [
      {id: 'platform', name: 'Platform'},
      {id: 'custody', name: 'Custody'},
      {name: 'Trading'}
    ]
  })
  expect(removeValue('unit', 'platform')(toTeamStructureInput(LEVELS))[0]?.values).toEqual([
    {id: 'custody', name: 'Custody'}
  ])
  expect(moveLevel('region', 0)(toTeamStructureInput(LEVELS)).map(({id}) => id)).toEqual([
    'region',
    'unit'
  ])
})

test('the roll-up counts teams under the first two levels, with the rest not set', () => {
  const rows = toTeamStructureRollup('Copper', LEVELS, ['apollo', 'borealis', 'cygnus', 'dorado'])
  expect(rows.map(({depth, name, teamCount}) => `${depth} ${name} ${teamCount}`)).toEqual([
    '0 Copper 4',
    '1 Platform 2',
    '2 Americas 1',
    '2 Not set 1',
    '1 Custody 1',
    '2 Not set 1',
    '1 Not set 1'
  ])
  expect(toTeamStructureRollup('Copper', [], ['apollo'])).toEqual([])
})
