import {
  Team,
  CreateTeamInput,
  CreateTeamOutput,
  UpdateTeamInput
} from './teamSchema';
import r from '../../../database/rethinkDriver';
import {
  GraphQLNonNull,
} from 'graphql';
import {requireSUOrTeamMember, requireSUOrSelf} from '../authorization';
import {updatedOrOriginal} from '../utils';

export default {
  createTeam: {
    type: CreateTeamOutput,
    description: 'Create a new team and add the first team member',
    args: {
      newTeam: {
        type: new GraphQLNonNull(CreateTeamInput),
        description: 'The new team object with exactly 1 team member'
      }
    },
    async resolve(source, {newTeam}, {authToken}) {
      // require cachedUserId in the input so an admin can also create a team
      const {leader, ...team} = newTeam;
      const userId = leader.cachedUserId;
      requireSUOrSelf(authToken, userId);
      // can't trust the client
      const verifiedLeader = {...leader, isActive: true, isLead: true, isFacilitator: true};
      await r.table('TeamMember').insert(verifiedLeader);
      await r.table('Team').insert(team);
      const updatedProfile = await r.table('UserProfile').get(userId).update({isNew: false}, {returnChanges: true});
      const outputObj = {
        team,
        leader: verifiedLeader,
        updatedProfile: updatedProfile.replaced > 0 ? updatedProfile.changes[0].new_val : null
      };
      return outputObj;
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
