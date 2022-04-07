import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const flagConversionModal: MutationResolvers['flagConversionModal'] = async (
  _source,
  {active, orgId}
) => {
  const r = await getRethink()

  // VALIDATION
  const organization = await r.table('Organization').get(orgId).run()
  if (!organization) {
    return {error: {message: 'Invalid orgId'}}
  }

  // RESOLUTION
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
