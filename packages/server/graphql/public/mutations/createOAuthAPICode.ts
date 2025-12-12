import {GraphQLError} from 'graphql'
import type {Kysely} from 'kysely'
import ms from 'ms'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {DB, Oauthscopeenum} from '../../../postgres/types/pg'
import type {GQLContext} from '../../graphql'

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
  _root: any,
  {input}: {input: CreateOAuthAPICodeInput},
  context: GQLContext
): Promise<CreateOAuthAPICodePayload> {
  const {clientId, redirectUri, scopes, state} = input
  const {authToken} = context

  if (!authToken?.sub) {
    throw new GraphQLError('Not authenticated')
  }

  const db = getKysely() as Kysely<DB>
  const provider = await db
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('clientId', '=', clientId)
    .executeTakeFirst()

  if (!provider) {
    console.error(`OAuth Error: Client ID '${clientId}' not found.`)
    throw new GraphQLError(`Invalid client_id: '${clientId}' not found.`)
  }

  if (!provider.redirectUris || !provider.redirectUris.includes(redirectUri)) {
    throw new GraphQLError(
      `Invalid redirect_uri: '${redirectUri}' is not registered for this client.`
    )
  }

  const expiresAt = new Date(Date.now() + ms('10m'))
  const codeId = generateUID()

  // No try/catch as per review
  await db
    .insertInto('OAuthAPICode')
    .values({
      id: codeId,
      clientId,
      redirectUri,
      userId: authToken.sub,
      scopes: scopes as Oauthscopeenum[],
      expiresAt: expiresAt.toISOString()
    })
    .execute()

  return {
    code: codeId,
    redirectUri,
    state
  }
}
