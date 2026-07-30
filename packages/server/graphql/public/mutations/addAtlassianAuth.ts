import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertAtlassianAuths from '../../../postgres/queries/upsertAtlassianAuths'
import {selectAtlassianAuth} from '../../../postgres/select'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {hasJiraScopes} from '../../../utils/hasJiraScopes'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import type {MutationResolvers} from '../resolverTypes'

const addAtlassianAuth: MutationResolvers['addAtlassianAuth'] = async (
  _source,
  {code, teamId},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // RESOLUTION
  const [oauthResponse, viewer] = await Promise.all([
    AtlassianServerManager.init(code),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (oauthResponse instanceof Error) {
    return standardError(new Error(`Jira: ${oauthResponse}`), {
      userId: viewerId
    })
  }
  const {accessToken, refreshToken} = oauthResponse
  const manager = new AtlassianServerManager(accessToken)
  const sites = await manager.getAccessibleResources()
  if (!Array.isArray(sites)) {
    return standardError(new Error(`Jira: ${sites.message}`), {
      userId: viewerId
    })
  }
  const cloudIds = sites.map((cloud) => cloud.id)
  const cloudId = cloudIds[0]
  if (!cloudId) {
    return standardError(new Error('Missing cloudId'), {userId: viewerId})
  }
  // RFC 6749 §5.1: the token response may omit scope, so fall back to the granted
  // scopes each site reports — still IdP-derived, never a guess at what was requested
  const scopeToStore =
    oauthResponse.scopes ??
    [
      ...new Set([
        ...sites.flatMap(({scopes}) => scopes),
        ...(refreshToken ? ['offline_access'] : [])
      ])
    ].join(' ')
  // getMyself is a Jira API call — a Confluence-only grant 401s on it. The account id
  // is also the sub claim of the OAuth access token (a JWT), which needs no scopes.
  const getAccountId = async (): Promise<string | Error> => {
    if (hasJiraScopes(scopeToStore)) {
      const self = await manager.getMyself(cloudId)
      return 'accountId' in self ? self.accountId : new Error(`Jira: ${self.message}`)
    }
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1]!, 'base64url').toString('utf8')
      )
      const sub = typeof payload.sub === 'string' ? payload.sub : ''
      return sub || new Error('Atlassian: token missing account id')
    } catch {
      return new Error('Atlassian: could not read account id from token')
    }
  }
  const accountId = await getAccountId()
  if (accountId instanceof Error) {
    return standardError(accountId, {userId: viewerId})
  }

  // if there are the same Jira integrations existing we need to update them with new credentials as well
  // if there's an existing integration for a given user and team (user used an option to refresh the token), skip it as
  // we'll create a new atlassian auth object for it for the upsert
  const userAtlassianAuths = await selectAtlassianAuth()
    .where('userId', '=', viewerId)
    .where('isActive', '=', true)
    .execute()
  // sibling-team rows receive the new token, so their scope must match it, too
  const atlassianAuthsToUpdate = userAtlassianAuths
    .filter((auth) => auth.accountId === accountId && auth.teamId !== teamId)
    .map((auth) => ({
      ...auth,
      accessToken,
      refreshToken: refreshToken!,
      scope: scopeToStore
    }))

  await upsertAtlassianAuths([
    {
      accountId,
      userId: viewerId,
      accessToken,
      refreshToken: refreshToken!,
      cloudIds,
      teamId,
      scope: scopeToStore
    },
    ...atlassianAuthsToUpdate
  ])
  updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, true)

  analytics.integrationAdded(viewer, teamId, 'jira')
  const data = {teamId, userId: viewerId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddAtlassianAuthPayload', data, subOptions)
  return data
}

export default addAtlassianAuth
