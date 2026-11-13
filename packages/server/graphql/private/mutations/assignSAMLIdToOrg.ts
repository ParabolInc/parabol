import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {CreditCard} from '../../../postgres/select'
import type {MutationResolvers} from '../resolverTypes'

const assignSAMLIdToOrg: MutationResolvers['assignSAMLIdToOrg'] = async (
  _source,
  {orgId, samlId}
) => {
  const pg = getKysely()

  // VALIDATION
  const normalizedSamlId = samlId?.trim()
  if (normalizedSamlId === '') {
    throw new GraphQLError('The SAML ID cannot be an empty string', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const organization = await pg
    .updateTable('Organization')
    .set({
      samlId: normalizedSamlId ?? null
    })
    .where('id', '=', orgId)
    .returningAll()
    .returning(({fn}) => [fn<CreditCard | null>('to_json', ['creditCard']).as('creditCard')])
    .executeTakeFirst()
  if (!organization) {
    throw new GraphQLError(`Organization not found`, {extensions: {code: 'NOT_FOUND'}})
  }
  return {organization}
}

export default assignSAMLIdToOrg
