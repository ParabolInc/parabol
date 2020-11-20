import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const JiraDimensionField = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraDimensionField',
  description: 'Poker dimensions mapped to their corresponding fields in jira',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({dimensionId, fieldName}) => `${dimensionId}:${fieldName}`
    },
    dimensionId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The poker template dimension Id'
    },
    fieldName: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The field name in jira that the estimate is pushed to'
    }
  })
})

export default JiraDimensionField
