import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'

export const canViewerOpenPage = async (
  {
    authToken,
    dataLoader,
    resourceGrants
  }: Pick<GQLContext, 'authToken' | 'dataLoader' | 'resourceGrants'>,
  pageId: number
) => {
  const role = await dataLoader
    .get('pageAccessByPageIdUserId')
    .load({pageId, userId: getUserId(authToken)})
  if (!role) return false
  return !resourceGrants || resourceGrants.hasPage(pageId)
}
