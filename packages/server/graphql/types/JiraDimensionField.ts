import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraDimensionFieldId from '../../../client/shared/gqlIds/JiraDimensionFieldId'
import {GQLContext} from '../graphql'

const JiraDimensionField = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraDimensionField',
  description: 'Poker dimensions mapped to their corresponding fields in jira',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, dimensionName, fieldId}) =>
        JiraDimensionFieldId.join(cloudId, dimensionName, fieldId)
    },
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloud that the field lives in'
    },
    dimensionName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the associated dimension'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project under the atlassian cloud the field lives in'
    },
    issueType: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Type id of the issue'
    },
    fieldId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID referring to the field name'
    },
    fieldName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The field name in jira that the estimate is pushed to'
    },
    fieldType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the type of field, e.g. number, string, any'
    }
  })
})

export default JiraDimensionField
