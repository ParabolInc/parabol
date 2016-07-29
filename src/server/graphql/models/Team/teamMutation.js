import r from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireSUOrSelf, requireWebsocket} from '../authorization';
import {updatedOrOriginal, errorObj} from '../utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString
} from 'graphql';
import {CreateTeamInput, UpdateTeamInput, Team, Phase} from './teamSchema';
import shuffle from 'universal/utils/shuffle';
import shortid from 'shortid';
import {phases} from 'universal/utils/constants';

const {CHECKIN} = phases;

export default {
  advanceFacilitator: {
    type: GraphQLBoolean,
    description: 'Advance the meeting forward. This is only called after the client does the math & sees that the meeting should advance',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamId to make sure the socket calling has permission'
      },
      nextPhase: {
        type: Phase,
        description: 'The desired phase for the meeting'
      },
      nextPhaseItem: {
        type: GraphQLString,
        description: 'The item within the phase to set the meeting to'
      }
    },
    async resolve(source, {teamId, nextPhase, nextPhaseItem = '0'}, {authToken, socket}) {
      requireWebsocket(socket);
      const dbHits = [
        requireSUOrTeamMember(authToken, teamId),
        r.table('Team').get(teamId).pluck('activeFacilitator')
      ];
      const [teamMember, team] = await Promise.all(dbHits);
      const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
      if (activeFacilitator !== teamMember.id) {
        throw errorObj({_error: 'Only the facilitator can advance the meeting'});
      }
      const isSynced = facilitatorPhase === meetingPhase && facilitatorPhaseItem === meetingPhaseItem;
      const updatedState = {
        facilitatorPhaseItem: nextPhaseItem,
      };
      if (isSynced) {
        updatedState.meetingPhaseItem = nextPhaseItem;
      }
      if (nextPhase) {
        updatedState.facilitatorPhase = nextPhase;
        if (isSynced) {
          updatedState.meetingPhase = nextPhase;
        }
      }
      await r.table('Team').get(teamId).update(updatedState);
      return true;
    }
  },
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
      shuffle(teamMembers);

      const updatedTeam = {
        meetingId: shortid.generate(),
        activeFacilitator: facilitatorId,
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: '0',
        meetingPhase: CHECKIN,
        meetingPhaseItem: '0'
      };
      const dbPromises = teamMembers.map((member, idx) => {
        return r.table('TeamMember').get(member.id).update({
          checkInOrder: idx,
          isCheckedIn: null
        });
      });
      dbPromises.push(r.table('Team').get(teamId).update(updatedTeam));
      await Promise.all(dbPromises);
      return true;
    }
  },
  killMeeting: {
    type: GraphQLBoolean,
    description: 'Finish a meeting abruptly',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team that will be having the meeting'
      }
    },
    async resolve(source, {teamId}, {authToken, socket}) {
      await requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      const ephemeralFields = [
        'meetingId',
        'activeFacilitator',
        'facilitatorPhase',
        'facilitatorPhaseItem',
        'meetingPhase',
        'meetingPhaseItem'
      ];
      await r.table('Team').get(teamId).replace(r.row.without(ephemeralFields));
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
