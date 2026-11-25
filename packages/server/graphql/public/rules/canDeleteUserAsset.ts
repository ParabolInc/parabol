import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type AuthToken from '../../../database/types/AuthToken'
import {getUserId, isTeamMember, isUserBillingLeader} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {RuleContext} from '../../graphql'
import {getUserAssetLocation} from '../mutations/helpers/getUserAssetLocation'
import type {MutationDeleteUserAssetArgs} from '../resolverTypes'

const getRefusal = async (
  url: string,
  authToken: AuthToken,
  {dataLoader, resourceGrants}: RuleContext
) => {
  const {scope, scopeCode} = getUserAssetLocation(url)
  const viewerId = getUserId(authToken)
  if (scope === 'User') {
    if (scopeCode !== viewerId) return 'You can only delete your own files'
    if (resourceGrants && !resourceGrants.isUnrestricted()) {
      return 'A connection limited to some organizations, teams or pages cannot delete your own files'
    }
  } else if (scope === 'Team') {
    if (!isTeamMember(authToken, scopeCode)) return 'Only members of the team can delete its files'
    if (resourceGrants && !(await resourceGrants.hasTeam(scopeCode))) {
      return 'This connection is not granted the team'
    }
  } else if (scope === 'Organization') {
    if (!(await isUserBillingLeader(viewerId, scopeCode, dataLoader))) {
      return 'Only billing leaders and admins of the organization can delete its files'
    }
    if (resourceGrants && !(await resourceGrants.hasOrg(scopeCode))) {
      return 'This connection is not granted the organization'
    }
  } else {
    const pageId = CipherId.decrypt(Number(scopeCode))
    const role = await dataLoader.get('pageAccessByPageIdUserId').load({pageId, userId: viewerId})
    if (role !== 'owner' && role !== 'editor') {
      return 'Only editors and owners of the page can delete its files'
    }
    if (resourceGrants && !(await resourceGrants.hasPage(pageId))) {
      return 'This connection is not granted the page'
    }
  }
  return null
}

export const canDeleteUserAsset = rule('canDeleteUserAsset', {cache: 'strict'})(
  async (_source, {url}: MutationDeleteUserAssetArgs, context: RuleContext) => {
    if (!context.authToken) return false
    try {
      const refusal = await getRefusal(url, context.authToken, context)
      return refusal ? new GraphQLError(refusal, {extensions: {code: 'FORBIDDEN'}}) : true
    } catch (error) {
      if (error instanceof GraphQLError) return error
      throw error
    }
  }
)
