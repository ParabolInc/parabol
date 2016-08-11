import r from 'server/database/rethinkDriver';
import {getUserId, requireAuth, requireSUOrTeamMember, requireWebsocket} from '../authorization';
import {updatedOrOriginal, errorObj} from '../utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString
} from 'graphql';
import {CreateTeamInput, UpdateTeamInput, Team} from './teamSchema';
import shuffle from 'universal/utils/shuffle';
import shortid from 'shortid';
import {CHECKIN, LOBBY, UPDATES, AGENDA} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import tmsSignToken from 'server/graphql/models/tmsSignToken';

export default {
  endMeeting: {
    type: GraphQLBoolean,
    description: 'Successfully end the meeting',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamId to make sure the socket calling has permission'
      }
    },
    // eslint-disable-next-line no-unused-vars
    async resolve(source, {teamId}, {authToken, socket}) {
      // TODO & remove above eslint pragma
      const teamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).pluck('id');
    // eslint-disable-next-line no-unused-vars
      const dbPromises = teamMembers.map((member, idx) => {
        // TODO & remove above eslint pragma
        return r.table('TeamMember').get(member.id).update({
          checkInOrder: idx,
          isCheckedIn: null
        });
      });

      const FOO = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).pluck('id');
      shuffle(FOO);
    }
  },
  moveMeeting: {
    type: GraphQLBoolean,
    description: 'Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too.',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamId to make sure the socket calling has permission'
      },
      nextPhase: {
        // http://stackoverflow.com/questions/37620012/passing-graphql-enumerated-value-type-as-argument-to-function
        type: GraphQLString,
        description: 'The desired phase for the meeting'
      },
      nextPhaseItem: {
        type: GraphQLString,
        description: 'The item within the phase to set the meeting to'
      }
    },
    async resolve(source, {teamId, nextPhase, nextPhaseItem = '0'}, {authToken, socket}) {
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      const team = await r.table('Team').get(teamId);
      const userId = getUserId(authToken);
      const teamMemberId = `${userId}::${teamId}`;
      const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
      if (activeFacilitator !== teamMemberId) {
        throw errorObj({_error: 'Only the facilitator can advance the meeting'});
      }
      const isSynced = facilitatorPhase === meetingPhase && facilitatorPhaseItem === meetingPhaseItem;
      let incrementsProgress;
      if (meetingPhase !== nextPhase) {
        incrementsProgress = true;
      } else if (nextPhase === CHECKIN || nextPhase === UPDATES) {
        incrementsProgress = Number(nextPhaseItem) - Number(meetingPhaseItem) === 1;
      } else if (nextPhase === AGENDA) {
        // TODO
        // incrementsProgress =
      }
      const moveMeeting = isSynced && incrementsProgress;

      const updatedState = {
        facilitatorPhaseItem: nextPhaseItem,
      };
      if (moveMeeting) {
        updatedState.meetingPhaseItem = nextPhaseItem;
      }
      if (nextPhase) {
        updatedState.facilitatorPhase = nextPhase;
        if (moveMeeting) {
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
      facilitatorId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The facilitator teamMemberId for this meeting'
      }
    },
    async resolve(source, {facilitatorId}, {authToken, socket}) {
      // facilitatorId is of format 'userId::teamId'
      const [, teamId] = facilitatorId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
      if (!facilitatorMembership || !facilitatorMembership.isActive) {
        throw errorObj({_error: 'facilitator is not active on that team'});
      }

      const meetingId = `${teamId}::${shortid.generate()}`;
      const updatedTeam = {
        meetingId,
        activeFacilitator: facilitatorId,
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 0,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 0
      };
      await r.table('Team').get(teamId).update(updatedTeam);
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
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      await r.table('Team').get(teamId).update({
        facilitatorPhase: LOBBY,
        meetingPhase: LOBBY,
        meetingId: null,
        facilitatorPhaseItem: null,
        meetingPhaseItem: null,
        activeFacilitator: null
      });
      return true;
    }
  },
  createTeam: {
    // return the new JWT that has the new tms field
    type: GraphQLID,
    description: 'Create a new team and add the first team member',
    args: {
      newTeam: {
        type: new GraphQLNonNull(CreateTeamInput),
        description: 'The new team object with exactly 1 team member'
      }
    },
    async resolve(source, {newTeam}, {authToken}) {
      const userId = requireAuth(authToken);
      if (newTeam.id.length > 10 || newTeam.id.indexOf('::') !== -1) {
        throw errorObj({_error: 'Bad id'});
      }
      const teamMemberId = `${userId}::${newTeam.id}`;

      const verifiedLeader = {id: teamMemberId, isActive: true, isLead: true, isFacilitator: true, checkInOrder: 0};
      const verifiedTeam = {
        ...newTeam,
        facilitatorPhase: LOBBY,
        meetingPhase: LOBBY,
        meetingId: null,
        facilitatorPhaseItem: null,
        meetingPhaseItem: null,
        activeFacilitator: null
      };
      const oldtms = authToken.tms || [];
      const tms = oldtms.concat(newTeam.id);
      const dbPromises = [
        r.table('TeamMember').insert(verifiedLeader),
        r.table('Team').insert(verifiedTeam),
        auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
      ];
      await Promise.all(dbPromises);
      return tmsSignToken(authToken, tms);
      // TODO: trigger welcome email
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
      const teamFromDB = await r.table('Team').get(id).update({name}, {returnChanges: true});
      // TODO think hard about if we can pluck only the changed values (in this case, name)
      return updatedOrOriginal(teamFromDB, updatedTeam);
    }
  }
};
