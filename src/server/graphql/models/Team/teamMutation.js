import r from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireSUOrSelf} from '../authorization';
import {updatedOrOriginal} from '../utils';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import {CreateTeamInput, UpdateTeamInput, Team} from './teamSchema';

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
      // require userId in the input so an admin can also create a team
      const {leader, ...team} = newTeam;
      const userId = leader.userId;
      requireSUOrSelf(authToken, userId);
      // can't trust the client
      const verifiedLeader = {...leader, isActive: true, isLead: true, isFacilitator: true};
      await r.table('TeamMember').insert(verifiedLeader);
      await r.table('Team').insert(team);
      await r.table('UserProfile').get(userId).update({isNew: false});
      // TODO: trigger welcome email
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
      await requireSUOrTeamMember(authToken, id);
      const teamFromDB = await r.table('Team').get(id).update({
        name
      }, {returnChanges: true});
      // TODO this mutation throws an error, but we don't have a use for it in the app yet
      console.log(teamFromDB);
      // TODO think hard about if we can pluck only the changed values (in this case, name)
      return updatedOrOriginal(teamFromDB, updatedTeam);
    }
  }
};
