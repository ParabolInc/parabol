import {GraphQLFloat, GraphQLObjectType, GraphQLNonNull} from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D';

const DraggerCoords = new GraphQLObjectType({
  name: 'DraggerCoords',
  description: 'Coordinates used to share a drag',
  fields: () => ({
    clientWidth: {
      type: new GraphQLNonNull(GraphQLFloat),
    }
    
    coords: {
      type: new GraphQLNonNull(Coords2D),
    }
  })
})

export default DraggerCoords
