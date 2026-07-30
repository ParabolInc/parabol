import getKysely from '../../../../../postgres/getKysely'
import AtlassianServerManager from '../../../../../utils/AtlassianServerManager'
import {hasConfluenceScopes} from '../../../../../utils/hasConfluenceScopes'
import type {DataLoaderWorker} from '../../../../graphql'

/**
 * The single source of truth for picking the Atlassian auth an export runs on: the
 * viewer's own auth for the given team, holding Confluence scopes, granted the target
 * site. Used identically by the export mutation (validation) and the job (execution).
 */
export const resolveConfluenceAuth = async (
  dataLoader: DataLoaderWorker,
  userId: string,
  teamId: string,
  cloudId: string
) => {
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) {
    return {auth: null, error: 'No Atlassian connection for this team'} as const
  }
  if (!hasConfluenceScopes(auth.scope)) {
    return {
      auth: null,
      error: 'Your Atlassian connection has not granted Confluence access'
    } as const
  }
  if (!auth.cloudIds.includes(cloudId)) {
    // stored cloudIds lag behind sites granted after consent; the site picker lists
    // sites live, so confirm against the live list before rejecting
    const sites = await new AtlassianServerManager(auth.accessToken).getAccessibleResources()
    const hasSite = Array.isArray(sites) && sites.some(({id}) => id === cloudId)
    if (!hasSite) {
      return {
        auth: null,
        error: 'Your Atlassian connection cannot access this Confluence site'
      } as const
    }
    await getKysely()
      .updateTable('AtlassianAuth')
      .set({cloudIds: sites.map(({id}) => id)})
      .where('userId', '=', userId)
      .where('accountId', '=', auth.accountId)
      .where('isActive', '=', true)
      .execute()
  }
  return {auth, error: null} as const
}
