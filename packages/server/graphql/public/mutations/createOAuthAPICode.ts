import crypto from 'crypto'
import {GraphQLError} from 'graphql'
import ms from 'ms'
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
    throw new GraphQLError(authorization.error)
  }
  const {provider, scopes} = authorization
  const {redirectUri, state, codeChallenge} = request
  const code = crypto.randomBytes(32).toString('hex')
  await getKysely()
    .insertInto('OAuthAPICode')
    .values({
      id: code,
      clientId: provider.clientId,
      redirectUri,
      userId: viewerId,
      scopes,
      codeChallenge,
      expiresAt: new Date(Date.now() + ms('10m'))
    })
    .execute()
  const redirectUrl = new URL(redirectUri)
  redirectUrl.searchParams.set('code', code)
  redirectUrl.searchParams.set('state', state)
  return {redirectUri: redirectUrl.toString()}
}

export default createOAuthAPICode
