import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import Task from './Task'

export const RefreshPokerEstimateIntegrationSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RefreshPokerEstimateIntegrationSuccess',
  fields: () => ({
    task: {
      type: new GraphQLNonNull(Task),
      description: 'The refreshed task with updated integration data',
      resolve: ({task}) => task
    }
  })
})

const RefreshPokerEstimateIntegrationPayload = makeMutationPayload(
  'RefreshPokerEstimateIntegrationPayload',
  RefreshPokerEstimateIntegrationSuccess
)

export default RefreshPokerEstimateIntegrationPayload
