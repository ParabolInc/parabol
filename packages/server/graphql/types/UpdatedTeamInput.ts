import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

const UpdatedTeamInput = new GraphQLInputObjectType({
  name: 'UpdatedTeamInput',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    name: {type: new GraphQLNonNull(GraphQLString), description: 'The name of the team'},
    picture: {
      type: GraphQLURLType,
      description: 'A link to the team’s profile image.'
    }
  })
})

export type UpdatedTeamInputType = {
  id: string
  name: string
  picture?: string | null
}

export default UpdatedTeamInput
