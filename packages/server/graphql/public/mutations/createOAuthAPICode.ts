import {Kysely} from 'kysely'
import OAuthAPICode from '../../../database/types/OAuthAPICode'
import {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {GQLContext} from '../../graphql'

interface CreateOAuthAPICodeInput {
  clientId: string
  redirectUri: string
  scopes: string[]
  state?: string | null
}

interface CreateOAuthAPICodePayload {
  code: string
  redirectUri: string
  state?: string | null
}

export default async function createOAuthAPICode(
  _root: unknown,
  {input}: {input: CreateOAuthAPICodeInput},
  context: GQLContext
): Promise<CreateOAuthAPICodePayload> {
  const {clientId, redirectUri, scopes, state} = input
  const {authToken} = context

  if (!authToken?.sub) {
    throw new Error('Not authenticated')
  }

  const db = getKysely() as unknown as Kysely<DB>
  const provider = await db
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('clientId', '=', clientId)
    .executeTakeFirst()

  if (!provider) {
    console.error(`OAuth Error: Client ID "${clientId}" not found.`)
    throw new Error(`Invalid client_id: "${clientId}" not found.`)
  }

  if (!provider.redirectUris || !provider.redirectUris.includes(redirectUri)) {
    console.error(
      `OAuth Error: Redirect URI "${redirectUri}" not allowed for client "${clientId}". Allowed: ${JSON.stringify(provider.redirectUris)}`
    )
    throw new Error(`Invalid redirect_uri: "${redirectUri}" is not registered for this client.`)
  }

  const code = new OAuthAPICode({
    clientId,
    redirectUri,
    userId: authToken.sub,
    scopes
  })

  try {
    await db.insertInto('OAuthAPICode').values(code).execute()
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
