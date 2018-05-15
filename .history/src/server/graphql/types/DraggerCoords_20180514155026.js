import {GraphQLFloat, GraphQLObjectType, GraphQLNonNull} from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D';

const DraggerCoords = new GraphQLObjectType({
  name: 'DraggerCoords',
  description: 'Coordinates used to share a drag',
  fields: () => ({
    clientWidth: {
      type: new GraphQLNonNull(GraphQLFloat),
    }
    distance: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'A float from 0 to 1 representing the % of the distance traveled from the origin to the target'
    }
    coords: {
      type: new GraphQLNonNull(Coords2D),
    }
  })
})

export default DraggerCoords
