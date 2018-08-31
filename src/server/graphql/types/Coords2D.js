import {GraphQLNonNull, GraphQLFloat, GraphQLObjectType} from 'graphql'

const Coords2D = new GraphQLObjectType({
  name: 'Coords2D',
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

export default Coords2D
