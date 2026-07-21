import crypto from 'crypto'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'

interface CreateOAuthCodeParams {
  clientId: string
  redirectUri: string
  scopes: string[]
  userId: string
  codeChallenge?: string
  codeChallengeMethod?: string
}

interface CreateOAuthCodeResult {
  code: string
}

export async function createOAuthCode(
  params: CreateOAuthCodeParams
): Promise<CreateOAuthCodeResult> {
  const {clientId, redirectUri, scopes, userId, codeChallenge, codeChallengeMethod} = params
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

  if (provider.isPublicClient && !codeChallenge) {
    throw new Error('code_challenge is required for public clients')
  }

  const allowedScopes = (provider.scopes as string[]) || []
  for (const scope of scopes) {
    if (!allowedScopes.includes(scope)) {
      throw new Error(`Invalid scope: '${scope}' is not allowed for this client.`)
    }
  }

  const expiresAt = new Date(Date.now() + ms('10m'))
  const code = crypto.randomBytes(32).toString('hex')
  const {id: codeId} = await pg
    .insertInto('OAuthAPICode')
    .values({
      id: code,
      clientId,
      redirectUri,
      userId,
      scopes: scopes as Oauthscopeenum[],
      expiresAt: expiresAt.toISOString(),
      ...(codeChallenge && {codeChallenge, codeChallengeMethod: codeChallengeMethod ?? 'S256'})
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  return {
    code: codeId
  }
}
