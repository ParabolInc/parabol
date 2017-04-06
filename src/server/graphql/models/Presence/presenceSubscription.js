import Presence from './presenceSchema';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';

export default {
  presence: {
    description: 'Listen for new folks to join a specified meeting & when they call `soundOff`, respond with `present`',
    type: new GraphQLList(Presence),
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID'
      }
    }
  }
};
