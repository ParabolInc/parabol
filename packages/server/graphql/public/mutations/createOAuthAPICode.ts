import crypto from 'crypto'
import {GraphQLError} from 'graphql'
import ms from 'ms'
import {validateOAuthAuthorizationRequest} from '../../../oauth2/validateOAuthAuthorizationRequest'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const MAX_GRANTED_IDS = 100

const createOAuthAPICode: MutationResolvers['createOAuthAPICode'] = async (
  _source,
  {request, scopes, grantedOrgIds, grantedTeamIds, grantedPageIds},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const authorization = await validateOAuthAuthorizationRequest(request)
  if ('error' in authorization) {
    throw new GraphQLError(authorization.error, {extensions: {code: authorization.code}})
  }
  if (scopes.length === 0) {
    throw new GraphQLError('Grant at least one scope', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (scopes.some((scope) => !authorization.scopes.includes(scope))) {
    throw new GraphQLError('Invalid scope: the application did not ask for every granted scope', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const grantedIds = {orgs: grantedOrgIds, teams: grantedTeamIds, pages: grantedPageIds}
  for (const [resource, ids] of Object.entries(grantedIds)) {
    if (ids && ids.length > MAX_GRANTED_IDS) {
      throw new GraphQLError(`Cannot grant access to more than ${MAX_GRANTED_IDS} ${resource}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  }
  const {provider, codeChallenge} = authorization
  const {redirectUri, state, resource} = request
  const code = crypto.randomBytes(32).toString('hex')
  await getKysely()
    .insertInto('OAuthAPICode')
    .values({
      id: code,
      clientId: provider.clientId,
      redirectUri,
      userId: viewerId,
      scopes,
      grantedOrgIds: grantedOrgIds ?? null,
      grantedTeamIds: grantedTeamIds ?? null,
      grantedPageIds: grantedPageIds ?? null,
      codeChallenge,
      resource: resource || null,
      expiresAt: new Date(Date.now() + ms('10m'))
    })
    .execute()
  const redirectUrl = new URL(redirectUri)
  redirectUrl.searchParams.set('code', code)
  redirectUrl.searchParams.set('state', state)
  return {redirectUri: redirectUrl.toString()}
}

export default createOAuthAPICode
