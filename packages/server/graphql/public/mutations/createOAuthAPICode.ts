import crypto from 'crypto'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import appOrigin from '../../../appOrigin'
import upsertMetadataDocumentProvider from '../../../oauth2/upsertMetadataDocumentProvider'
import {validateOAuthAuthorizationRequest} from '../../../oauth2/validateOAuthAuthorizationRequest'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const createOAuthAPICode: MutationResolvers['createOAuthAPICode'] = async (
  _source,
  {request},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const authorization = await validateOAuthAuthorizationRequest(request, viewerId, dataLoader)
  if ('error' in authorization) {
    throw new GraphQLError(authorization.error, {extensions: {code: authorization.code}})
  }
  const {provider, scopes, isMetadataDocumentClient} = authorization
  const {redirectUri, state, codeChallenge, resource} = request
  const code = crypto.randomBytes(32).toString('hex')
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      if (isMetadataDocumentClient) await upsertMetadataDocumentProvider(trx, provider)
      await trx
        .insertInto('OAuthAPICode')
        .values({
          id: code,
          clientId: provider.clientId,
          redirectUri,
          userId: viewerId,
          scopes,
          codeChallenge,
          resource: resource || null,
          grantedOrgIds: provider.orgId ? [provider.orgId] : null,
          personalGrantedAt: provider.orgId ? null : sql`now()`,
          expiresAt: new Date(Date.now() + ms('10m'))
        })
        .execute()
    })
  const redirectUrl = new URL(redirectUri)
  redirectUrl.searchParams.set('code', code)
  redirectUrl.searchParams.set('state', state)
  redirectUrl.searchParams.set('iss', appOrigin)
  return {redirectUri: redirectUrl.toString()}
}

export default createOAuthAPICode
