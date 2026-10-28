import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {fromOrgStructureKey} from '../../../reports/orgStructure'
import type {MutationResolvers} from '../resolverTypes'

const placeTeam: MutationResolvers['placeTeam'] = async (
  _source,
  {teamId, levelId: levelKey, valueId: valueKey},
  {dataLoader}
) => {
  // VALIDATION
  const {orgId} = await dataLoader.get('teams').loadNonNull(teamId)
  const {levels} = await dataLoader.get('orgStructureByOrgId').load(orgId)
  const levelId = fromOrgStructureKey(levelKey, 'OrgStructureLevel')
  const level = levels.find(({id}) => id === levelId)
  if (!level) throw new GraphQLError('That level isn’t part of this team’s organization')
  const valueId = valueKey ? fromOrgStructureKey(valueKey, 'OrgStructureValue') : null
  if (valueKey && !level.values.some(({id}) => id === valueId)) {
    throw new GraphQLError('That value isn’t part of the level')
  }

  // RESOLUTION
  const pg = getKysely()
  if (valueId === null) {
    await pg
      .deleteFrom('OrgStructurePlacement')
      .where('teamId', '=', teamId)
      .where('levelId', '=', level.id)
      .execute()
  } else {
    await pg
      .insertInto('OrgStructurePlacement')
      .values({teamId, levelId: level.id, valueId})
      .onConflict((oc) => oc.columns(['teamId', 'levelId']).doUpdateSet({valueId}))
      .execute()
  }
  dataLoader.get('orgStructureByOrgId').clear(orgId)
  return {orgId}
}

export default placeTeam
