import getKysely from '../../../postgres/getKysely'
import {CreditCard} from '../../../postgres/select'
import {MutationResolvers} from '../resolverTypes'

const assignSAMLIdToOrg: MutationResolvers['assignSAMLIdToOrg'] = async (
  _source,
  {orgId, samlId}
) => {
  const pg = getKysely()

  // VALIDATION
  const normalizedSamlId = samlId?.trim()
  if (normalizedSamlId === '') {
    return {error: {message: 'The SAML ID cannot be an empty string'}}
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
    return {error: {message: `Organization not found`}}
  }
  return {organization}
}

export default assignSAMLIdToOrg
