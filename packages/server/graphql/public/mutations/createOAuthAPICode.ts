import {GraphQLError} from 'graphql'
import type {Kysely} from 'kysely'
import OAuthAPICode from '../../../database/types/OAuthAPICode'
import getKysely from '../../../postgres/getKysely'
import type {DB} from '../../../postgres/types/pg'
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
    console.error(`OAuth Error: Client ID "${clientId}" not found.`)
    throw new GraphQLError(`Invalid client_id: "${clientId}" not found.`)
  }

  if (!provider.redirectUris || !provider.redirectUris.includes(redirectUri)) {
    throw new GraphQLError(
      `Invalid redirect_uri: "${redirectUri}" is not registered for this client.`
    )
  }

  const code = new OAuthAPICode({
    clientId,
    redirectUri,
    userId: authToken.sub,
    scopes
  })

  try {
    await db
      .insertInto('OAuthAPICode')
      .values({
        id: code.id,
        clientId: code.clientId,
        redirectUri: code.redirectUri,
        userId: code.userId,
        scopes: code.scopes,
        expiresAt: code.expiresAt.toISOString(),
        createdAt: code.createdAt.toISOString()
      })
      .execute()
  } catch (err) {
    throw new GraphQLError(`Failed to create authorization code: ${err}}`)
  }

  return {
    code: code.id,
    redirectUri,
    state
  }
}
