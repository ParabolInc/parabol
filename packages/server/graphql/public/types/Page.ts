import {GraphQLError} from 'graphql'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import isValid from '../../isValid'
import type {ReqResolvers} from './ReqResolvers'

const Page: ReqResolvers<'Page'> = {
  access: ({id}) => ({id}),
  parentPage: async ({parentPageId}, _args, {authToken, dataLoader}) => {
    if (!parentPageId) return null
    const [parentPage, access] = await Promise.all([
      dataLoader.get('pages').load(parentPageId),
      dataLoader.get('pageAccessByUserId').load({userId: authToken.sub, pageId: parentPageId})
    ])
    if (!parentPage) throw new GraphQLError('Parent page not found')
    return {
      ...parentPage,
      __typename: access ? 'Page' : 'PagePreview'
    }
  },
  parentPageId: ({parentPageId}) => (parentPageId ? CipherId.toClient(parentPageId, 'page') : null),
  sortOrder: async (
    {id: pageId, isPrivate, teamId, parentPageId, sortOrder},
    _args,
    {authToken, dataLoader}
  ) => {
    const isTopLevelShared = !teamId && !parentPageId && !isPrivate
    if (!isTopLevelShared) return sortOrder
    const viewerId = getUserId(authToken)
    const userSortOrder = await dataLoader.get('pageUserSortOrder').load({pageId, userId: viewerId})
    // should never be null, but just in case
    return userSortOrder || '!'
  },
  ancestorIds: ({ancestorIds}) => ancestorIds.map((id) => CipherId.toClient(id, 'page')),
  ancestors: async ({ancestorIds}, _args, {authToken, dataLoader}) => {
    const accessKeys = ancestorIds.map((pageId) => ({
      pageId,
      userId: authToken.sub
    }))
    const [pages, accesses] = await Promise.all([
      dataLoader.get('pages').loadMany(ancestorIds),
      dataLoader.get('pageAccessByUserId').loadMany(accessKeys)
    ])
    const validPages = pages.filter(isValid)
    if (validPages.length < pages.length) {
      throw new GraphQLError('Page not found')
    }
    return validPages.map((page, idx) => {
      const access = accesses[idx] instanceof Error ? null : accesses[idx]
      return {
        ...page,
        __typename: access ? 'Page' : 'PagePreview'
      }
    })
  },
  team: async ({teamId}, _args, {authToken, dataLoader}) => {
    if (!teamId) return null
    const [teamMember, team] = await Promise.all([
      dataLoader.get('teamMembers').load(TeamMemberId.join(teamId, authToken.sub)),
      dataLoader.get('teams').load(teamId)
    ])
    if (!teamMember) return null
    return team || null
  },
  deletedByUser: async ({deletedBy}, _args, {dataLoader}) => {
    if (!deletedBy) return null
    const user = await dataLoader.get('users').loadNonNull(deletedBy)
    return user
  }
}

export default Page
