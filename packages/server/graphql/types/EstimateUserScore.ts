import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const EstimateUserScore = new GraphQLObjectType<any, GQLContext>({
  name: 'EstimateUserScore',
  description:
    'The user and number of points they estimated for dimension (where 1 stage has 1 dimension)',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({stageId, userId}) => {
        return `score:${stageId}:${userId}`
      }
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The stageId'
    },
    userId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The userId that for this score'
    },
    value: {
      type: GraphQLNonNull(GraphQLFloat),
      description:
        'the value that existed in the scale at the time of the vote. note that this value may no longer exist on the scale'
    },
    label: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The label that was associated with the score at the time of the vote'
    }
  })
})

export default EstimateUserScore
