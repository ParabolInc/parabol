import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'

export const repoIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  }
})

const RepoIntegration = new GraphQLInterfaceType({
  name: 'RepoIntegration',
  fields: repoIntegrationFields
})

export default RepoIntegration
