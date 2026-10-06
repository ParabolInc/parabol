import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import type {GQLContext} from '../../../graphql'
import fetchGCalIssues from './fetchGCalIssues'
import fetchGitHubIssues from './fetchGitHubIssues'
import fetchJiraIssues from './fetchJiraIssues'
import fetchLinearIssues from './fetchLinearIssues'
import fetchParabolIssues from './fetchParabolIssues'
import type {InspirationIssue} from './issuesForAI'

const fetchIssues = async (
  service: string,
  searchQuery: string,
  teamId: string,
  viewerId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<InspirationIssue[]> => {
  const {dataLoader} = context
  switch (service) {
    case 'github':
      return fetchGitHubIssues(teamId, viewerId, searchQuery, dataLoader, context, info)
    case 'jira':
      return fetchJiraIssues(teamId, viewerId, searchQuery, dataLoader)
    case 'linear':
      return fetchLinearIssues(teamId, viewerId, searchQuery, context, info)
    case 'gcal':
      return fetchGCalIssues(teamId, viewerId, searchQuery, dataLoader)
    case 'PARABOL':
      return fetchParabolIssues(teamId, viewerId, searchQuery)
    default:
      throw new GraphQLError(`Inspiration items are not yet supported for ${service}`)
  }
}

export default fetchIssues
