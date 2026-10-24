import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {toTeamStructureRowId} from '../../../reports/teamStructure'
import type {MutationResolvers} from '../resolverTypes'

const placeTeam: MutationResolvers['placeTeam'] = async (
  _source,
  {teamId, levelId: levelClientId, valueId: valueClientId},
  {dataLoader}
) => {
  // VALIDATION
  const {orgId} = await dataLoader.get('teams').loadNonNull(teamId)
  const {levels} = await dataLoader.get('teamStructureByOrgId').load(orgId)
  const levelId = toTeamStructureRowId(levelClientId, 'TeamStructureLevel')
  const level = levels.find(({id}) => id === levelId)
  if (!level) throw new GraphQLError('That level isn’t part of this team’s organization')
  const valueId = valueClientId ? toTeamStructureRowId(valueClientId, 'TeamStructureValue') : null
  if (valueClientId && !level.values.some(({id}) => id === valueId)) {
    throw new GraphQLError('That value isn’t part of the level')
  }

  // RESOLUTION
  const pg = getKysely()
  if (valueId === null) {
    await pg
      .deleteFrom('TeamStructurePlacement')
      .where('teamId', '=', teamId)
      .where('levelId', '=', level.id)
      .execute()
  } else {
    await pg
      .insertInto('TeamStructurePlacement')
      .values({teamId, levelId: level.id, valueId})
      .onConflict((oc) => oc.columns(['teamId', 'levelId']).doUpdateSet({valueId}))
      .execute()
  }
  dataLoader.get('teamStructureByOrgId').clear(orgId)
  return {orgId}
}

export default placeTeam
