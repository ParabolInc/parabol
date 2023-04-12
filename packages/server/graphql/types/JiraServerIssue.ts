import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {JiraServerIssue as JiraServerRestIssue} from '../../dataloader/jiraServerLoaders'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'

type JiraServerIssueSource = JiraServerRestIssue & {
  userId: string
  teamId: string
  providerId: number
}

const VOTE_FIELD_ID_BLACKLIST = ['description', 'summary']
const VOTE_FIELD_ALLOWED_TYPES = ['string', 'number']

const JiraServerIssue = new GraphQLObjectType<JiraServerIssueSource, GQLContext>({
  name: 'JiraServerIssue',
  description: 'The Jira Issue that comes direct from Jira Server',
  interfaces: () => [TaskIntegration],
  isTypeOf: ({service}) => service === 'jiraServer',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'GUID providerId:repositoryId:issueId',
      resolve: ({id, projectId, providerId}) => {
        return JiraServerIssueId.join(providerId, projectId, id)
      }
    },
    issueKey: {
      type: new GraphQLNonNull(GraphQLID)
    },
    issueType: {
      type: new GraphQLNonNull(GraphQLID)
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The url to access the issue',
      resolve: ({issueKey, self}) => {
        const {origin} = new URL(self)
        return `${origin}/browse/${issueKey}`
      }
    },
    summary: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the jira issue'
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    descriptionHTML: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description converted into raw HTML'
    },
    possibleEstimationFieldNames: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString))),
      resolve: async ({teamId, userId, providerId, issueType, projectId}, _args, {dataLoader}) => {
        const issueMeta = await dataLoader
          .get('jiraServerFieldTypes')
          .load({teamId, userId, projectId, issueType, providerId})
        if (!issueMeta) return []
        const fieldNames = issueMeta
          .filter(
            ({fieldId, operations, schema}) =>
              !VOTE_FIELD_ID_BLACKLIST.includes(fieldId) &&
              operations.includes('set') &&
              VOTE_FIELD_ALLOWED_TYPES.includes(schema.type)
          )
          .map(({name}) => name)
        return fieldNames
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: JiraServerIssue.name,
  nodeType: JiraServerIssue,
  edgeFields: () => ({
    cursor: {
      type: GraphQLString
    }
  }),
  connectionFields: () => ({
    error: {
      type: StandardMutationError,
      description: 'An error with the connection, if any'
    }
  })
})

export const JiraServerIssueConnection = connectionType
export const JiraServerIssueEdge = edgeType
export default JiraServerIssue
