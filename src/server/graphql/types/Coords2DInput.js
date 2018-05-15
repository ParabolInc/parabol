import {GraphQLFloat, GraphQLInputObjectType} from 'graphql'

const Coords2DInput = new GraphQLInputObjectType({
  name: 'Coords2DInput',
  description: 'Coordinates used relay a location in a 2-D plane',
  fields: () => ({
    x: {
      type: GraphQLFloat
    },
    y: {
      type: GraphQLFloat
    }
  })
})

export default Coords2DInput
