import {randomBytes} from 'crypto'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'

interface CreateOAuthCodeParams {
  clientId: string
  redirectUri: string
  scopes: string[]
  userId: string
}

interface CreateOAuthCodeResult {
  code: string
  redirectUri: string
}

export async function createOAuthCode(
  params: CreateOAuthCodeParams
): Promise<CreateOAuthCodeResult> {
  const {clientId, redirectUri, scopes, userId} = params
  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('clientId', '=', clientId)
    .executeTakeFirst()

  if (!provider) {
    throw new Error(`Invalid client_id: '${clientId}' not found.`)
  }

  if (!provider.redirectUris || !provider.redirectUris.includes(redirectUri)) {
    throw new Error(`Invalid redirect_uri: '${redirectUri}' is not registered for this client.`)
  }

  const expiresAt = new Date(Date.now() + ms('10m'))
  const codeId = randomBytes(32).toString('base64url')

  await pg
    .insertInto('OAuthAPICode')
    .values({
      id: codeId,
      clientId,
      redirectUri,
      userId,
      scopes: scopes as Oauthscopeenum[],
      expiresAt: expiresAt.toISOString()
    })
    .execute()

  return {
    code: codeId,
    redirectUri
  }
}
