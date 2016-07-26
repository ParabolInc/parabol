import r from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireSUOrSelf, requireWebsocket, requireWebsocketExchange} from '../authorization';
import {updatedOrOriginal, errorObj} from '../utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {CreateTeamInput, UpdateTeamInput, Team} from './teamSchema';
import shuffle from 'universal/utils/shuffle';
import shortid from 'shortid';
import {phases} from 'universal/utils/constants';

const {CHECKIN} = phases;

export default {
  startMeeting: {
    type: GraphQLBoolean,
    description: 'Start a meeting from the lobby',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team that will be having the meeting'
      },
      facilitatorId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The facilitator teamMemberId for this meeting'
      }
    },
    async resolve(source, {teamId, facilitatorId}, {authToken, socket}) {
      await requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
      if (facilitatorMembership.teamId !== teamId || !facilitatorMembership.isActive) {
        throw errorObj({_error: 'facilitator is not active on that team'});
      }
      const teamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).pluck('id');
      const checkInOrder = shuffle(teamMembers.map(member => member.id));
      // note that anyone can be activeFacilitator, even if isFacilitator === false
      await r.table('Team').get(teamId).update({
        meetingId: shortid.generate(),
        checkInOrder,
        checkedInMembers: 0,
        activeFacilitator: facilitatorId,
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 0,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 0
      });
      return true;
    }
  },
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
      await r.table('User').get(userId).update({isNew: false});
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
