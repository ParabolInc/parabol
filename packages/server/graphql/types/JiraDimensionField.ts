import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const JiraDimensionField = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraDimensionField',
  description: 'Poker dimensions mapped to their corresponding fields in jira',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, dimensionId, fieldId}) => `${cloudId}:${dimensionId}:${fieldId}`
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloud that the field lives in'
    },
    dimensionId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The poker template dimension Id'
    },
    fieldId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID referring to the field name'
    },
    fieldName: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The field name in jira that the estimate is pushed to'
    },
    fieldType: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the type of field, e.g. number, string, any'
    }
  })
})

export default JiraDimensionField
