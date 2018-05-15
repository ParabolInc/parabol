import {GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql'

const UpdateLocationDragInput = new GraphQLInputObjectType({
  name: 'UpdateLocationDragInput',
  fields: () => ({
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {
      type: GraphQLID,
      description: 'The unique orginization ID that pays for the team'
    }
  })
})

export default UpdateLocationDragInput
