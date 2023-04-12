import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import getSignOnURL from './helpers/SAMLHelpers/getSignOnURL'

const updateSAML: MutationResolvers['updateSAML'] = async (
  _source,
  {orgId, metadata},
  {authToken}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const samlRecord = await r
    .table('SAML')
    .getAll(orgId, {index: 'orgId'})
    .limit(1)
    .nth(0)
    .default(null)
    .run()

  if (!samlRecord) {
    return standardError(new Error('SAML has not been created in Parabol yet'), {userId: viewerId})
  }

  const url = metadata ? getSignOnURL(metadata, samlRecord.id) : null
  if (url instanceof Error) return standardError(new Error(url.message), {userId: viewerId})

  await r
    .table('SAML')
    .get(samlRecord.id)
    .update({
      url,
      metadata: metadata || null
    })
    .run()

  return {success: true}
}

export default updateSAML
