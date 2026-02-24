import {GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import Task from './Task'

export const SetTaskEstimateSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetTaskEstimateSuccess',
  fields: () => ({
    task: {
      type: new GraphQLNonNull(Task)
    },
    stage: {
      type: EstimateStage,
      description: 'The stage that holds the updated finalScore, if meetingId was provided',
      resolve: resolveStage('ESTIMATE')
    },
    exportCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of Jira exports for this cloudId. 0 for non-Jira integrations.',
      resolve: (source: any) => source.exportCount ?? 0
    }
  })
})

const SetTaskEstimatePayload = makeMutationPayload('SetTaskEstimatePayload', SetTaskEstimateSuccess)

export default SetTaskEstimatePayload
