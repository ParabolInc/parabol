import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import Task from './Task'
import makeMutationPayload from './makeMutationPayload'

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
    }
  })
})

const SetTaskEstimatePayload = makeMutationPayload('SetTaskEstimatePayload', SetTaskEstimateSuccess)

export default SetTaskEstimatePayload
