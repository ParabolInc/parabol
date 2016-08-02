import r from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireSUOrSelf, requireWebsocket} from '../authorization';
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

export default {
  moveMeeting: {
    type: GraphQLBoolean,
    description: `Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too.`,
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
      requireWebsocket(socket);
      const dbHits = [
        requireSUOrTeamMember(authToken, teamId),
        r.table('Team').get(teamId)
      ];
      const [teamMember, team] = await Promise.all(dbHits);
      const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
      if (activeFacilitator !== teamMember.id) {
        throw errorObj({_error: 'Only the facilitator can advance the meeting'});
      }
      const isSynced = facilitatorPhase === meetingPhase && facilitatorPhaseItem === meetingPhaseItem;
      let incrementsProgress;
      if (nextPhase === CHECKIN || nextPhase === UPDATES) {
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
      const verifiedLeader = {...leader, isActive: true, isLead: true, isFacilitator: true, checkInOrder: 0};
      const verifiedTeam = {...team, facilitatorPhase: LOBBY, meetingPhase: LOBBY};
      const dbPromises = [
        r.table('TeamMember').insert(verifiedLeader),
        r.table('Team').insert(verifiedTeam),
        r.table('User').get(userId).update({isNew: false})
      ];
      await Promise.all(dbPromises);
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
