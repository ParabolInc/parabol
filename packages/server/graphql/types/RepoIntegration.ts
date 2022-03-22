import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'

export const repoIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  },
  service: {
    type: new GraphQLNonNull(IntegrationProviderServiceEnum)
  }
})

const RepoIntegration = new GraphQLInterfaceType({
  name: 'RepoIntegration',
  description: 'The suggested repos and projects a user can integrate with',
  fields: repoIntegrationFields
})

export default RepoIntegration
