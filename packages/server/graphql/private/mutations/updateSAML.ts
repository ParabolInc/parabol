import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'
import normalizeSlugName from './helpers/normalizeSlugName'

const updateSAML: MutationResolvers['updateSAML'] = async (_source, {slug, samlOrgAttribute}) => {
  const pg = getKysely()

  // VALIDATION
  const slugName = normalizeSlugName(slug)
  if (slugName instanceof Error) return {error: {message: slugName.message}}

  const normalizedSamlOrgAttribute = samlOrgAttribute?.trim()
  if (normalizedSamlOrgAttribute === '') {
    return {error: {message: 'The attribute name cannot be an empty string'}}
  }

  const saml = await pg
    .updateTable('SAML')
    .set({
      samlOrgAttribute: normalizedSamlOrgAttribute ?? null
    })
    .where('id', '=', slugName)
    .returningAll()
    .executeTakeFirst()
  if (!saml) {
    return {
      error: {
        message: `No SAML found for ${slugName}`
      }
    }
  }
  return {saml}
}

export default updateSAML
