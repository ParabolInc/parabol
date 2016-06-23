import {Team, CreateTeamInput, UpdateTeamInput} from './teamSchema';
import r from '../../../database/rethinkDriver';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';

export default {
  createTeam: {
    type: GraphQLBoolean,
    description: 'Create a new team and add the first team member',
    args: {
      newTeam: {
        type: new GraphQLNonNull(CreateTeamInput),
        description: 'The new team object with exactly 1 team member'
      }
    },
    async resolve(source, {newTeam}, {authToken}) {
      requireSUOrTeamMember(authToken, newTeam.id);
      const {leader, ...team} = newTeam;
      r.table('TeamMember').insert(leader);
      r.table('Team').insert(team);
      return true;
    }
  },
  updateTeamName: {
    type: Team,
    args: {
      updatedTeam: {
        type: new GraphQLNonNull(UpdateTeamInput),
        description: 'The input object containing the teamId and any modified fields'
      }
    },
    async resolve(source, {updatedTeam}, {authToken}) {
      const {id, name} = updatedTeam;
      requireSUOrTeamMember(authToken, id);
      const updatedTeam = await r.table('Team').get(id).update({
        name
      }, {returnChanges: true});
      // TODO think hard about if we can pluck only the changed values (in this case, name)
      return updatedTeam.changes[0].new_val;
    }
  }
};
