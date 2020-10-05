import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
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
    score: {
      type: GraphQLNonNull(GraphQLFloat),
      description:
        'the value of the score. label is determined by this. note that if a template is modified, the corresponding label may no longer exists'
    }
  })
})

export default EstimateUserScore
