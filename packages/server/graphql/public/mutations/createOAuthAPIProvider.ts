import {Kysely} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import OAuthAPIProvider from '../../../database/types/OAuthAPIProvider'
import generateRandomString from '../../../generateRandomString'
import type {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface CreateOAuthAPIProviderInput {
  orgId: string
  name: string
  redirectUris: string[]
  scopes: string[]
}

export default async function createOAuthAPIProvider(
  _root: unknown,
  {input}: {input: CreateOAuthAPIProviderInput},
  context: GQLContext
) {
  const {orgId, name, redirectUris, scopes} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  if (!(await isUserOrgAdmin(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  const db = getKysely() as unknown as Kysely<DB>

  const provider = new OAuthAPIProvider({
    organizationId: orgId,
    name,
    clientId: 'prbl-cid-' + generateRandomString(16),
    clientSecret: 'prbl-s-' + generateRandomString(32),
    redirectUris,
    scopes
  })

  await db.insertInto('OAuthAPIProvider').values(provider).execute()

  const data = {
    provider,
    organization: {
      id: orgId
    }
  }
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'CreateOAuthAPIProviderSuccess', data, {})

  return {provider}
}
