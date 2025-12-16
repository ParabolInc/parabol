import ms from 'ms'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import {CipherId} from '../utils/CipherId'

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
  const {id: codeId} = await pg
    .insertInto('OAuthAPICode')
    .values({
      clientId,
      redirectUri,
      userId,
      scopes: scopes as Oauthscopeenum[],
      expiresAt: expiresAt.toISOString()
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  return {
    code: CipherId.toClient(codeId, 'OAuthAPICode'),
    redirectUri
  }
}
