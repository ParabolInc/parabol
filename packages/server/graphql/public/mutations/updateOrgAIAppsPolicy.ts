import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const updateOrgAIAppsPolicy: MutationResolvers['updateOrgAIAppsPolicy'] = async (
  _source,
  {orgId, policy},
  {dataLoader}
) => {
  await getKysely()
    .updateTable('Organization')
    .set({aiAppsPolicy: policy})
    .where('id', '=', orgId)
    .execute()
  dataLoader.get('organizations').clear(orgId)
  return {orgId}
}

export default updateOrgAIAppsPolicy
