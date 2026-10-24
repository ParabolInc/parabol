import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import type {InspirationIssue} from '../../../../integrations/platform/InspirationIssue'
import {getServerIntegration} from '../../../../integrations/platform/registry'
import type {GQLContext} from '../../../graphql'
import fetchParabolIssues from './fetchParabolIssues'

const fetchIssues = async (
  service: string,
  searchQuery: string,
  teamId: string,
  viewerId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<InspirationIssue[]> => {
  if (service === 'PARABOL') return fetchParabolIssues(teamId, viewerId, searchQuery)
  const issueList = getServerIntegration(service)?.capabilities.issueList
  if (!issueList) {
    throw new GraphQLError(`Inspiration items are not yet supported for ${service}`)
  }
  const {dataLoader} = context
  return issueList.listIssues({dataLoader, teamId, userId: viewerId, context, info}, searchQuery)
}

export default fetchIssues
