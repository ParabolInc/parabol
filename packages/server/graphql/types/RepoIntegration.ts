import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'

export const repoIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  }
})

const RepoIntegration = new GraphQLInterfaceType({
  name: 'RepoIntegration',
  description: 'The suggested repos and projects a user can integrate with',
  fields: repoIntegrationFields
})

export default RepoIntegration
