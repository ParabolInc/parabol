import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

const Presence = new GraphQLObjectType({
  name: 'Presence',
  description: 'A connection\'s presence in a team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The socketId representing a single socket connection'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The userId representing 1 or more sockets'},
    editing: {type: GraphQLID, description: 'The normalized object id currently edited by the user' }
  })
});

export default Presence;
