import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'
import getSignOnURL from './helpers/SAMLHelpers/getSignOnURL'

const updateSAML: MutationResolvers['updateSAML'] = async (_source, {orgId, metadata}, {}) => {
  const r = await getRethink()

  // RESOLUTION
  const samlRecord = await r
    .table('SAML')
    .getAll(orgId, {index: 'orgId'})
    .limit(1)
    .nth(0)
    .default(null)
    .run()

  if (!samlRecord) {
    return {error: {message: 'SAML has not been created in Parabol yet.'}}
  }

  const url = metadata ? getSignOnURL(metadata, samlRecord.id) : null
  if (url instanceof Error) return {error: {message: url.message}}

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
