import {GraphQLNonNull, GraphQLFloat, GraphQLInputObjectType} from 'graphql'

const Coords2DInput = new GraphQLInputObjectType({
  name: 'Coords2DInput',
  description: 'Coordinates used relay a location in a 2-D plane',
  fields: () => ({
    x: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    y: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  })
})

export default Coords2DInput
