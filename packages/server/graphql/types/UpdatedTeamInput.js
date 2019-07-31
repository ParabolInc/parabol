import {GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

const UpdatedTeamInput = new GraphQLInputObjectType({
  name: 'UpdatedTeamInput',
  fields: () => ({
    id: {type: GraphQLID},
    name: {type: GraphQLString, description: 'The name of the team'},
    picture: {
      type: GraphQLURLType,
      description: 'A link to the team’s profile image.'
    }
  })
})

export default UpdatedTeamInput
