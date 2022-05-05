import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import AzureDevOpsDimensionFieldId from '../../../client/shared/gqlIds/AzureDevOpsDimensionFieldId'
import {GQLContext} from '../graphql'

const AzureDevOpsDimensionField = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsDimensionField',
  description: 'Poker dimensions mapped to their corresponding fields in Azure DevOps',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({instanceId, dimensionName, fieldId}) =>
        AzureDevOpsDimensionFieldId.join(instanceId, dimensionName, fieldId)
    },
    instanceId: {
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
    fieldId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID referring to the field name'
    },
    fieldName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The field name in Azure DevOps that the estimate is pushed to'
    },
    fieldType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the type of field, e.g. number, string, any'
    }
  })
})

export default AzureDevOpsDimensionField
