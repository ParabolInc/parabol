import {Kysely} from 'kysely'
import OAuthCode from '../../../database/types/OAuthCode'
import {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {GQLContext} from '../../graphql'

interface CreateOAuthCodeInput {
  clientId: string
  redirectUri: string
  scopes: string[]
  state?: string | null
}

interface CreateOAuthCodePayload {
  code: string
  redirectUri: string
  state?: string | null
}

export default async function createOAuthCode(
  _root: unknown,
  {input}: {input: CreateOAuthCodeInput},
  context: GQLContext
): Promise<CreateOAuthCodePayload> {
  const {clientId, redirectUri, scopes, state} = input
  const {authToken} = context

  if (!authToken?.sub) {
    throw new Error('Not authenticated')
  }

  const db = getKysely() as unknown as Kysely<DB>
  const org = await db
    .selectFrom('Organization')
    .selectAll()
    .where('oauthClientId', '=', clientId)
    .executeTakeFirst()

  if (!org) {
    console.error(`OAuth Error: Client ID "${clientId}" not found in any organization.`)
    throw new Error(`Invalid client_id: "${clientId}" not found.`)
  }

  if (!org.oauthRedirectUris || !org.oauthRedirectUris.includes(redirectUri)) {
    console.error(
      `OAuth Error: Redirect URI "${redirectUri}" not allowed for client "${clientId}". Allowed: ${JSON.stringify(org.oauthRedirectUris)}`
    )
    throw new Error(`Invalid redirect_uri: "${redirectUri}" is not registered for this client.`)
  }

  const code = new OAuthCode({
    clientId,
    redirectUri,
    userId: authToken.sub,
    scopes
  })

  try {
    await db.insertInto('OAuthCode').values(code).execute()
  } catch (err) {
    console.error('Error creating OAuth code:', err)
    throw new Error('Failed to create authorization code')
  }

  return {
    code: code.id,
    redirectUri,
    state
  }
}
