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
    throw new Error('Invalid client_id')
  }

  if (!org.oauthRedirectUris || !org.oauthRedirectUris.includes(redirectUri)) {
    throw new Error('Invalid redirect_uri')
  }

  const code = new OAuthCode({
    clientId,
    redirectUri,
    userId: authToken.sub,
    scopes
  })

  await db.insertInto('OAuthCode').values(code).execute()

  return {
    code: code.id,
    redirectUri,
    state
  }
}
