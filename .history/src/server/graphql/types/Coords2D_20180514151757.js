import {GraphQLFloat, GraphQLObjectType} from 'graphql'

const DraggerCoords = new GraphQLObjectType({
  name: 'Coords2D',
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

export default DraggerCoords
