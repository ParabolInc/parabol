import {Team, TeamInput} from './teamSchema';
import r from '../../../database/rethinkDriver';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';

export default {
  createTeam: {
    type: Team,
    args: {
      newTeam: {
        type: new GraphQLNonNull(TeamInput),
        description: 'the new team object'
      }
    },
    async resolve(source, {newTeam}) {
      r.table('Team').insert(newTeam);
      return newTeam;
    }
  },
  updateTeamName: {
    type: Team,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID'
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the new team name'
      }
    },
    async resolve(source, {teamId, name}) {
      const updatedTeam = await r.table('Team').get(teamId).update({
        name,
      }, {returnChanges: true});
      return updatedTeam.changes[0].new_val;
    }
  }
};
