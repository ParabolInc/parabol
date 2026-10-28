export interface OrgStructureLevelData {
  readonly id: string
  readonly name: string
  readonly values: readonly {
    readonly id: string
    readonly name: string
    readonly teamIds: readonly string[]
  }[]
}

export interface OrgStructureLevelInput {
  id?: string
  name: string
  values: {id?: string; name: string}[]
}

// An edit names levels and values by id, so a queued one still applies after an earlier save lands
export type OrgStructureEdit = (levels: OrgStructureLevelInput[]) => OrgStructureLevelInput[]

export const toOrgStructureInput = (
  levels: readonly OrgStructureLevelData[]
): OrgStructureLevelInput[] =>
  levels.map(({id, name, values}) => ({
    id,
    name,
    values: values.map((value) => ({id: value.id, name: value.name}))
  }))

const updateLevel =
  (
    levelId: string,
    update: (level: OrgStructureLevelInput) => OrgStructureLevelInput
  ): OrgStructureEdit =>
  (levels) =>
    levels.map((level) => (level.id === levelId ? update(level) : level))

export const addLevel =
  (name: string): OrgStructureEdit =>
  (levels) => [...levels, {name, values: []}]

export const renameLevel = (levelId: string, name: string) =>
  updateLevel(levelId, (level) => ({...level, name}))

export const removeLevel =
  (levelId: string): OrgStructureEdit =>
  (levels) =>
    levels.filter(({id}) => id !== levelId)

export const moveLevel =
  (levelId: string, toIndex: number): OrgStructureEdit =>
  (levels) => {
    const moving = levels.find(({id}) => id === levelId)
    if (!moving) return levels
    const others = levels.filter((level) => level !== moving)
    return [...others.slice(0, toIndex), moving, ...others.slice(toIndex)]
  }

export const addValue = (levelId: string, name: string) =>
  updateLevel(levelId, (level) => ({...level, values: [...level.values, {name}]}))

export const renameValue = (levelId: string, valueId: string, name: string) =>
  updateLevel(levelId, (level) => ({
    ...level,
    values: level.values.map((value) => (value.id === valueId ? {...value, name} : value))
  }))

export const removeValue = (levelId: string, valueId: string) =>
  updateLevel(levelId, (level) => ({
    ...level,
    values: level.values.filter(({id}) => id !== valueId)
  }))

export const toPlacedValueIds = (levels: readonly OrgStructureLevelData[]) =>
  new Map(
    levels.map((level) => [
      level.id,
      new Map(
        level.values.flatMap((value) => value.teamIds.map((teamId) => [teamId, value.id] as const))
      )
    ])
  )
