import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'

export const isOrgAdminBySAMLDomain = rule('isOrgAdminBySAMLDomain', {cache: 'strict'})(
  async (_source, args, {authToken, dataLoader}: GQLContext) => {
    const {domain} = args as {domain: string}
    const saml = await dataLoader.get('samlByDomain').load(domain)
    if (!saml?.orgId) return new GraphQLError('Domain not found')
    const viewerId = getUserId(authToken)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({orgId: saml.orgId, userId: viewerId})
    if (organizationUser?.role !== 'ORG_ADMIN') return new GraphQLError('Must be an org admin')
    return true
  }
)
