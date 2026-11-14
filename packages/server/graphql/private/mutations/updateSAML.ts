import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'
import normalizeSlugName from './helpers/normalizeSlugName'

const updateSAML: MutationResolvers['updateSAML'] = async (
  _source,
  {slug, samlOrgAttribute},
  {dataLoader}
) => {
  const pg = getKysely()

  // VALIDATION
  const slugName = normalizeSlugName(slug)
  if (slugName instanceof Error)
    throw new GraphQLError(slugName.message, {extensions: {code: 'BAD_USER_INPUT'}})

  const normalizedSamlOrgAttribute = samlOrgAttribute?.trim()
  if (normalizedSamlOrgAttribute === '') {
    throw new GraphQLError('The attribute name cannot be an empty string', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
    throw new GraphQLError(`No SAML found for ${slugName}`, {extensions: {code: 'NOT_FOUND'}})
  }
  const samlWithDomains = await dataLoader.get('saml').loadNonNull(slugName)
  return {saml: samlWithDomains}
}

export default updateSAML
