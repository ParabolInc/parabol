import {CipherId} from '../utils/CipherId'

export interface TeamStructureValueSource {
  id: number
  orgId: string
  levelId: number
  name: string
}

export interface TeamStructureLevelSource {
  id: number
  orgId: string
  name: string
  values: TeamStructureValueSource[]
}

export interface TeamStructure {
  // widest first
  levels: TeamStructureLevelSource[]
  placements: {teamId: string; levelId: number; valueId: number}[]
}

// A team structure level as the engine splits by it, keyed by the level's row. Level 0 is one that was removed
// while a report still splits by it, which puts every row in one group
export type ReportLevelDimension = `level:${number}`
export const REMOVED_LEVEL_DIMENSION: ReportLevelDimension = 'level:0'

export const toLevelDimension = (levelId: number): ReportLevelDimension => `level:${levelId}`

export const isLevelDimension = <T extends string>(
  dimension: T | ReportLevelDimension
): dimension is ReportLevelDimension => dimension.startsWith('level:')

export const toLevelRowId = (dimension: ReportLevelDimension) =>
  Number(dimension.slice('level:'.length))

type TeamStructureEntity = 'TeamStructureLevel' | 'TeamStructureValue'

export const toTeamStructureId = (rowId: number, entity: TeamStructureEntity) =>
  CipherId.toClient(rowId, entity)

// a level and its values with the ids the API uses, for anything outside the engine, like AI
export const toClientTeamStructureLevels = (levels: TeamStructureLevelSource[]) =>
  levels.map(({id, name, values}) => ({
    id: toTeamStructureId(id, 'TeamStructureLevel'),
    name,
    values: values.map((value) => ({
      id: toTeamStructureId(value.id, 'TeamStructureValue'),
      name: value.name
    }))
  }))

export type ClientTeamStructureLevel = ReturnType<typeof toClientTeamStructureLevels>[number]

// null for an id that isn't one of these, so a mangled id is a missing level rather than a query error
export const toTeamStructureRowId = (clientId: string, entity: TeamStructureEntity) => {
  const [rowId, , idEntity] = CipherId.fromClient(clientId)
  return idEntity === entity && Number.isInteger(rowId) ? rowId : null
}
