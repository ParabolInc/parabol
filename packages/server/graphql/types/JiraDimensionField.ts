import base64url from 'base64url'
import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const JiraDimensionField = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraDimensionField',
  description: 'Poker dimensions mapped to their corresponding fields in jira',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, dimensionName, fieldId}) =>
        `${cloudId}:${base64url.encode(dimensionName)}:${fieldId}`
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloud that the field lives in'
    },
    dimensionName: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The immutable index of the dimension'
    },
    projectKey: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The project under the atlassian cloud the field lives in'
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
