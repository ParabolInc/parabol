import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import JiraServerIssueFieldMetadata from './JiraServerIssueFieldMetadata'
import { JiraServerIssue as JiraServerRestIssue } from '../../dataloader/jiraServerLoaders'

type JiraServerIssueSource = JiraServerRestIssue & {
  userId: string
  teamId: string
  providerId: number
}

const VOTE_FIELD_ID_BLACKLIST = ['description','summary']

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
    issueTypeId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
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
      type: new GraphQLNonNull(GraphQLURLType),
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
    fieldMetadata: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(JiraServerIssueFieldMetadata))),
      resolve: async ({teamId, userId, providerId, issueTypeId, projectId}, _args, {dataLoader}) => {
        const issueMeta = await dataLoader.get('jiraServerFieldTypes').load({teamId, userId, projectId, issueTypeId, providerId})
        if (!issueMeta) return []
          const meta = issueMeta.filter(({fieldId, operations, schema}) => 
                                        !VOTE_FIELD_ID_BLACKLIST.includes(fieldId)
                                        && operations.includes('set')
                                        && ['string', 'number'].includes(schema.type))
                        .map(({fieldId, name, allowedValues, schema}) => ({
          id: fieldId,
          name,
          typeId: schema.type,
          allowedValues
        }))
        return meta
      }
    },
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: JiraServerIssue.name,
  nodeType: JiraServerIssue,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    },
    error: {
      type: StandardMutationError,
      description: 'An error with the connection, if any'
    }
  })
})

export const JiraServerIssueConnection = connectionType
export const JiraServerIssueEdge = edgeType
export default JiraServerIssue

