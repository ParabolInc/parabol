import {GraphQLError} from 'graphql'
import {
  MAX_TEAM_STRUCTURE_LEVELS,
  MAX_TEAM_STRUCTURE_NAME_LENGTH,
  MAX_TEAM_STRUCTURE_VALUES
} from '../../../../client/shared/reports/reportCatalog'
import getKysely from '../../../postgres/getKysely'
import {toTeamStructureRowId} from '../../../reports/teamStructure'
import type {MutationResolvers} from '../resolverTypes'

const toName = (name: string, thing: string) => {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > MAX_TEAM_STRUCTURE_NAME_LENGTH) {
    throw new GraphQLError(
      `${thing} needs a name of 1 to ${MAX_TEAM_STRUCTURE_NAME_LENGTH} characters`
    )
  }
  return trimmed
}

const hasDuplicateName = (names: string[]) =>
  new Set(names.map((name) => name.toLowerCase())).size !== names.length

const setTeamStructure: MutationResolvers['setTeamStructure'] = async (
  _source,
  {orgId, levels},
  {dataLoader}
) => {
  // VALIDATION
  if (levels.length > MAX_TEAM_STRUCTURE_LEVELS) {
    throw new GraphQLError(`A team structure has up to ${MAX_TEAM_STRUCTURE_LEVELS} levels`)
  }
  const {levels: currentLevels} = await dataLoader.get('teamStructureByOrgId').load(orgId)
  const levelIdByValueId = new Map(
    currentLevels.flatMap(({id, values}) => values.map((value) => [value.id, id] as const))
  )
  const nextLevels = levels.map((level) => {
    const levelId = level.id ? toTeamStructureRowId(level.id, 'TeamStructureLevel') : null
    if (level.id && !currentLevels.some(({id}) => id === levelId)) {
      throw new GraphQLError('That level isn’t part of this organization')
    }
    if (level.values.length > MAX_TEAM_STRUCTURE_VALUES) {
      throw new GraphQLError(`A level has up to ${MAX_TEAM_STRUCTURE_VALUES} values`)
    }
    const values = level.values.map((value) => {
      const valueId = value.id ? toTeamStructureRowId(value.id, 'TeamStructureValue') : null
      if (value.id && (valueId === null || levelIdByValueId.get(valueId) !== levelId)) {
        throw new GraphQLError('That value isn’t part of its level')
      }
      return {id: valueId, name: toName(value.name, 'A value')}
    })
    if (hasDuplicateName(values.map(({name}) => name))) {
      throw new GraphQLError('Each value of a level needs its own name')
    }
    return {id: levelId, name: toName(level.name, 'A level'), values}
  })
  if (hasDuplicateName(nextLevels.map(({name}) => name))) {
    throw new GraphQLError('Each level needs its own name')
  }

  // RESOLUTION
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const keptLevelIds = nextLevels.flatMap(({id}) => (id === null ? [] : [id]))
      await trx
        .deleteFrom('TeamStructureLevel')
        .where('orgId', '=', orgId)
        .$if(keptLevelIds.length > 0, (qb) => qb.where('id', 'not in', keptLevelIds))
        .execute()
      for (const [levelIdx, level] of nextLevels.entries()) {
        const {id: levelId} =
          level.id === null
            ? await trx
                .insertInto('TeamStructureLevel')
                .values({orgId, name: level.name, sortOrder: levelIdx})
                .returning('id')
                .executeTakeFirstOrThrow()
            : await trx
                .updateTable('TeamStructureLevel')
                .set({name: level.name, sortOrder: levelIdx})
                .where('id', '=', level.id)
                .returning('id')
                .executeTakeFirstOrThrow()
        const keptValueIds = level.values.flatMap(({id}) => (id === null ? [] : [id]))
        await trx
          .deleteFrom('TeamStructureValue')
          .where('levelId', '=', levelId)
          .$if(keptValueIds.length > 0, (qb) => qb.where('id', 'not in', keptValueIds))
          .execute()
        for (const [valueIdx, value] of level.values.entries()) {
          if (value.id === null) {
            await trx
              .insertInto('TeamStructureValue')
              .values({levelId, name: value.name, sortOrder: valueIdx})
              .execute()
          } else {
            await trx
              .updateTable('TeamStructureValue')
              .set({name: value.name, sortOrder: valueIdx})
              .where('id', '=', value.id)
              .execute()
          }
        }
      }
    })
  dataLoader.get('teamStructureByOrgId').clear(orgId)
  return {orgId}
}

export default setTeamStructure
