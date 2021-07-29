import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import Task from './Task'

export const SetTaskEstimateSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetTaskEstimateSuccess',
  fields: () => ({
    task: {
      type: GraphQLNonNull(Task)
    },
    stage: {
      type: EstimateStage,
      description: 'The stage that holds the updated finalScore, if meetingId was provided',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const SetTaskEstimatePayload = makeMutationPayload('SetTaskEstimatePayload', SetTaskEstimateSuccess)

export default SetTaskEstimatePayload
