import {getUserId, isTeamMember} from '../../../utils/authorization'
import type {UpdatePagePayloadResolvers} from '../resolverTypes'

export type UpdatePagePayloadSource = {pageId: number}

const UpdatePagePayload: UpdatePagePayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => {
    return dataLoader.get('pages').loadNonNull(pageId)
  },
  pageSection: async ({pageId}, _args, {authToken, dataLoader}) => {
    // this determines what section the page should get put in for the viewer
    // it follows the same rules are the User.pages query
    const page = await dataLoader.get('pages').loadNonNull(pageId)
    const {isPrivate, teamId, parentPageId} = page
    // If the page is private it's either a subpage of a private page, or its a top-level private page
    if (isPrivate) {
      return parentPageId ? 'page' : 'private'
    }
    // if it not private, has no team and no parent, it must be in shared
    if (!teamId && !parentPageId) return 'shared'
    // if it has a teamId, it's a top-level team page.
    // If the user has access to that team, it will be there, else shared
    if (teamId) {
      return isTeamMember(authToken, teamId) ? 'team' : 'shared'
    }
    // if the page has a parent, it will be a subpage unless it doesn't have access to that parent
    if (parentPageId) {
      const userId = getUserId(authToken)
      const hasParentAccess = await dataLoader
        .get('pageAccessByUserId')
        .load({pageId: parentPageId, userId})
      return hasParentAccess ? 'page' : 'shared'
    }
    // unreachable as teamId/parentPageId branches have already been exhausted
    return 'shared'
  }
}

export default UpdatePagePayload
