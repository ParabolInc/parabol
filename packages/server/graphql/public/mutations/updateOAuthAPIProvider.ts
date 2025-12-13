import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {validateOAuthScopes} from '../../../oauth2/oauthScopes'
import getKysely from '../../../postgres/getKysely'
import {selectOAuthAPIProvider} from '../../../postgres/select'
import type {Oauthscopeenum} from '../../../postgres/types/pg'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateOAuthAPIProvider: MutationResolvers['updateOAuthAPIProvider'] = async (
  _source,
  {input},
  context
) => {
  const {providerId, name, redirectUris, scopes} = input
  const {authToken, dataLoader, socketId} = context
  const viewerId = getUserId(authToken)

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .select('orgId')
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new GraphQLError('Provider not found')
  }

  if (!(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
    throw new GraphQLError('Not organization lead', {
      extensions: {
        code: 'FORBIDDEN',
        userId: viewerId
      }
    })
  }

  if (scopes) {
    if (!validateOAuthScopes(scopes)) {
      throw new GraphQLError('Invalid scopes. Only graphql:read and graphql:write are allowed.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          userId: viewerId
        }
      })
    }
  }

  await pg
    .updateTable('OAuthAPIProvider')
    .set({
      name: name ?? undefined,
      redirectUris: redirectUris ?? undefined,
      scopes: scopes ? (scopes as Oauthscopeenum[]) : undefined
    })
    .where('id', '=', providerId)
    .execute()

  const updatedProvider = await selectOAuthAPIProvider()
    .where('id', '=', providerId)
    .executeTakeFirstOrThrow()

  const data = {
    provider: updatedProvider,
    organization: {
      id: provider.orgId
    }
  }
  publish(SubscriptionChannel.ORGANIZATION, provider.orgId, 'UpdateOAuthAPIProviderSuccess', data, {
    mutatorId: socketId
  })

  return {
    provider: updatedProvider
  }
}

export default updateOAuthAPIProvider
