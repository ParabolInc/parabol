import { Team } from './teamSchema';
import r from '../../../database/rethinkDriver';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export default {
  createTeam: {
    type: Team,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team id'
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the new team name'
      }
    },
    async resolve(source, {id, name}) {
      const newTeam = {
        id,
        name
      };
      await r.table('Team').insert(newTeam);
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
