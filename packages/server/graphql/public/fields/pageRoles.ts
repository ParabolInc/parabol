import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {UserResolvers} from '../resolverTypes'

const MAX_PAGE_IDS = 500

export const pageRoles: NonNullable<UserResolvers['pageRoles']> = async (
  _source,
  {pageIds},
  {authToken, dataLoader}
) => {
  if (pageIds.length > MAX_PAGE_IDS) {
    throw new GraphQLError(`pageIds may hold at most ${MAX_PAGE_IDS} ids`)
  }
  const userId = getUserId(authToken)
  const roles = await dataLoader
    .get('pageAccessByPageIdUserId')
    .loadMany(pageIds.map((pageId) => ({pageId: CipherId.fromClient(pageId)[0], userId})))
  return roles.map((role) => (role instanceof Error ? null : role))
}
