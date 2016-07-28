import {GraphQLNonNull, GraphQLID} from 'graphql';
import {Team} from './teamSchema';
import {errorObj} from '../utils';
import {getTeamById} from './helpers';

export default {
  getTeamById: {
    type: Team,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID for the desired Team'
      }
    },
    async resolve(source, {teamId}) {
      const team = await getTeamById(teamId);
      if (!team) {
        throw errorObj({_error: 'Team not found'});
      }
      return team;
    }
  }
};
