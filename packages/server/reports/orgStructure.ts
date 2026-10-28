import {CipherId} from '../utils/CipherId'

export interface OrgStructureValueSource {
  id: number
  orgId: string
  levelId: number
  name: string
}

export interface OrgStructureLevelSource {
  id: number
  orgId: string
  name: string
  values: OrgStructureValueSource[]
}

export interface OrgStructure {
  // widest first
  levels: OrgStructureLevelSource[]
  placements: {teamId: string; levelId: number; valueId: number}[]
}

// An org structure level as the engine splits by it, keyed by the level's row. Level 0 is one that was removed
// while a report still splits by it, which puts every row in one group
export type ReportLevelDimension = `level:${number}`
export const REMOVED_LEVEL_DIMENSION: ReportLevelDimension = 'level:0'

export const toLevelDimension = (levelId: number): ReportLevelDimension => `level:${levelId}`

export const isLevelDimension = <T extends string>(
  dimension: T | ReportLevelDimension
): dimension is ReportLevelDimension => dimension.startsWith('level:')

export const toLevelRowId = (dimension: ReportLevelDimension) =>
  Number(dimension.slice('level:'.length))

type OrgStructureEntity = 'OrgStructureLevel' | 'OrgStructureValue'

export const toOrgStructureId = (rowId: number, entity: OrgStructureEntity) =>
  CipherId.toClient(rowId, entity)

// a level and its values with the ids the API uses, for anything outside the engine, like AI
export const toClientOrgStructureLevels = (levels: OrgStructureLevelSource[]) =>
  levels.map(({id, name, values}) => ({
    id: toOrgStructureId(id, 'OrgStructureLevel'),
    name,
    values: values.map((value) => ({
      id: toOrgStructureId(value.id, 'OrgStructureValue'),
      name: value.name
    }))
  }))

export type ClientOrgStructureLevel = ReturnType<typeof toClientOrgStructureLevels>[number]

// null for an id that isn't one of these, so a mangled id is a missing level rather than a query error
export const toOrgStructureRowId = (clientId: string, entity: OrgStructureEntity) => {
  const [rowId, , idEntity] = CipherId.fromClient(clientId)
  return idEntity === entity && Number.isInteger(rowId) ? rowId : null
}
