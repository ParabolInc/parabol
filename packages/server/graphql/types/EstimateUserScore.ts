import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import EstimateUserScoreId from '../../../client/shared/gqlIds/EstimateUserScoreId'
import {GQLContext} from '../graphql'
import User from './User'

const EstimateUserScore = new GraphQLObjectType<any, GQLContext>({
  name: 'EstimateUserScore',
  description:
    'The user and number of points they estimated for dimension (where 1 stage has 1 dimension)',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({stageId, userId}) => {
        return EstimateUserScoreId.join(stageId, userId)
      }
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stageId'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId that for this score'
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user that for this score',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The label that was associated with the score at the time of the vote. Note: It may no longer exist on the dimension'
    }
  })
})

export default EstimateUserScore
