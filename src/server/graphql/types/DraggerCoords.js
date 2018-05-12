import {GraphQLFloat, GraphQLObjectType} from 'graphql'

const DraggerCoords = new GraphQLObjectType({
  name: 'DraggerCoords',
  description: 'Coordinates used to share a drag',
  fields: () => ({
    height: {
      type: GraphQLFloat,
      description:
        'The width of the client of the person dragging (useful to standardize across screen sizes)'
    },
    width: {
      type: GraphQLFloat,
      description:
        'The width of the client of the person dragging (useful to standardize across screen sizes)'
    },
    x: {
      type: GraphQLFloat,
      description: 'The x-offset from the current location'
    },
    y: {
      type: GraphQLFloat,
      description: 'The y-offset from the current location'
    }
  })
})

export default DraggerCoords
