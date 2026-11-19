import crypto from 'crypto'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import appOrigin from '../../../appOrigin'
import getEffectiveOrgIds from '../../../oauth2/getEffectiveOrgIds'
import upsertMetadataDocumentProvider from '../../../oauth2/upsertMetadataDocumentProvider'
import {validateOAuthAuthorizationRequest} from '../../../oauth2/validateOAuthAuthorizationRequest'
import getKysely from '../../../postgres/getKysely'
import type {OAuthAPIProvider} from '../../../postgres/types'
import {getUserId} from '../../../utils/authorization'
import type {DataLoaderWorker} from '../../graphql'
import type {MutationResolvers} from '../resolverTypes'

const refuse = (message: string) =>
  new GraphQLError(message, {extensions: {code: 'BAD_USER_INPUT'}})

const validateGrantedOrgIds = async (
  provider: Pick<OAuthAPIProvider, 'orgId' | 'verifiedAt'>,
  grantedOrgIds: string[],
  includePrivate: boolean,
  viewerId: string,
  dataLoader: DataLoaderWorker
) => {
  if (grantedOrgIds.length === 0 && !includePrivate) {
    throw refuse('Choose at least one organization or your private pages')
  }
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
  const isViewerOrg = (orgId: string) =>
    organizationUsers.some((organizationUser) => organizationUser.orgId === orgId)
  if (!grantedOrgIds.every(isViewerOrg)) {
    throw refuse("You can't give this app access to an organization you're not in")
  }
  const allowedOrgIds = await getEffectiveOrgIds({
    provider,
    grantedOrgIds,
    userId: viewerId,
    dataLoader
  })
  const blockedOrgId = grantedOrgIds.find((orgId) => !allowedOrgIds.includes(orgId))
  if (blockedOrgId) {
    const {name} = await dataLoader.get('organizations').loadNonNull(blockedOrgId)
    throw refuse(`You can't give this app access to ${name}`)
  }
}

const createOAuthAPICode: MutationResolvers['createOAuthAPICode'] = async (
  _source,
  {request, grantedOrgIds, includePrivate},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const authorization = await validateOAuthAuthorizationRequest(request, viewerId, dataLoader)
  if ('error' in authorization) {
    throw new GraphQLError(authorization.error, {extensions: {code: authorization.code}})
  }
  const {provider, scopes, isMetadataDocumentClient} = authorization
  const consentedOrgIds = grantedOrgIds ? [...new Set(grantedOrgIds)] : null
  if (!provider.orgId && consentedOrgIds) {
    await validateGrantedOrgIds(provider, consentedOrgIds, includePrivate, viewerId, dataLoader)
  }
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
          grantedOrgIds: provider.orgId ? [provider.orgId] : consentedOrgIds,
          personalGrantedAt: !provider.orgId && includePrivate ? sql`now()` : null,
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
