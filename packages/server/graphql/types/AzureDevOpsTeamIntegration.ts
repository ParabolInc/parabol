import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AzureDevOpsDimensionField from './AzureDevOpsDimensionField'

const AzureDevOpsTeamIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsTeamIntegration',
  description: 'The AzureDevOps integration details shared across an entire team',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({id: teamId}) => `azureDevOpsTeamIntegration:${teamId}`
    },
    azureDevOpsDimensionFields: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AzureDevOpsDimensionField))),
      description: 'The dimensions and their corresponding AzureDevOps fields',
      resolve: ({azureDevOpsDimensionFields}) => azureDevOpsDimensionFields || []
    }
  })
})

export default AzureDevOpsTeamIntegration
