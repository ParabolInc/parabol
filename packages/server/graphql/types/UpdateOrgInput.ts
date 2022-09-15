import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

const UpdateOrgInput = new GraphQLInputObjectType({
  name: 'UpdateOrgInput',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique action ID'},
    name: {
      type: GraphQLString,
      description: 'The name of the org'
    },
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    }
  })
})

export type UpdateOrgInputType = {
  id: string
  name?: string | null
  picture?: string | null
}

export default UpdateOrgInput
