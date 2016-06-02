import { Team } from './teamSchema';
import r from '../../../database/rethinkDriver';
import uuid from 'node-uuid';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export default {
  createTeam: {
    type: Team,
    args: {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the new team name'
      }
    },
    async resolve(source, {name}) {
      const newTeam = {
        // TODO: a uuid is overkill. let's make it small for smaller urls & friendly socket payloads
        id: uuid.v4(),
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
