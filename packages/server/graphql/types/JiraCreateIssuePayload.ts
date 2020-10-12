import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'
import JiraIssue from './JiraIssue'
import {getUserId} from '../../utils/authorization'
import AtlassianServerManager from '../../utils/AtlassianServerManager'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({cloudId, key}) => {
        return `${cloudId}:${key}`
      }
    },
    // jiraIssue: {
    //   type: JiraIssue,
    //   resolve: async ({cloudId, key, teamId}, _args, {authToken, dataLoader}) => {
    //     console.log('PAYLOAD key', key)
    //     console.log('PAYLOAD cloudId', cloudId)
    //     const userId = getUserId(authToken)
    //     const accessToken = await dataLoader.get('freshAtlassianAccessToken').load({teamId, userId})
    //     const manager = new AtlassianServerManager(accessToken)
    //     const issueRes = await manager.getIssue(cloudId, key)
    //     console.log('PAYLOAD issueRes', issueRes)
    //     return issueRes
    //   }
    // },
    summary: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The content of the Jira issue'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the Jira issue'
    },
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The url of the issue that lives in Jira',
      resolve: ({cloudName, key}) => {
        console.log('URL PAYLOAD cloudName', cloudName)
        return `https://${cloudName}.atlassian.net/browse/${key}`
      }
    }
  })
})

export default JiraCreateIssuePayload
