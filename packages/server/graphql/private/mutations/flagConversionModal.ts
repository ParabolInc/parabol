import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const flagConversionModal: MutationResolvers['flagConversionModal'] = async (
  _source,
  {active, orgId},
  {dataLoader}
) => {
  const r = await getRethink()

  // VALIDATION
  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    return {error: {message: 'Invalid orgId'}}
  }

  // RESOLUTION
  organization.showConversionModal = active
  await getKysely()
    .updateTable('Organization')
    .set({showConversionModal: active})
    .where('id', '=', orgId)
    .execute()
  await r
    .table('Organization')
    .get(orgId)
    .update({
      showConversionModal: active
    })
    .run()

  return {orgId}
}

export default flagConversionModal
