import r from '../../../database/rethinkDriver';
import {requireSUOrTeamMember,requireSUOrSelf, requireWebsocketExchange, requireWebsocket} from '../authorization';
import {updatedOrOriginal} from '../utils';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import {CreateMeetingInput, UpdateMeetingInput, Meeting} from './meetingSchema';
import {SOUNDOFF, PRESENT} from '../../../../universal/subscriptions/constants';

export default {
  createMeeting: {
    type: GraphQLBoolean,
    description: 'Create a new meeting and add the first team member',
    args: {
      newMeeting: {
        type: new GraphQLNonNull(CreateMeetingInput),
        description: 'The new meeting object with exactly 1 team member'
      }
    },
    async resolve(source, {newMeeting}, {authToken}) {
      // require userId in the input so an admin can also create a team
      const {leader, ...meeting} = newMeeting;
      const userId = leader.userId;
      requireSUOrSelf(authToken, userId);
      // can't trust the client
      const verifiedLeader = {...leader, isActive: true, isLead: true, isFacilitator: true};
      await r.table('TeamMember').insert(verifiedLeader);
      await r.table('Meeting').insert(meeting);
      await r.table('UserProfile').get(userId).update({isNew: false});
      // TODO: trigger welcome email
      return true;
    }
  },
  updateMeetingName: {
    type: Meeting,
    args: {
      updatedMeeting: {
        type: new GraphQLNonNull(UpdateMeetingInput),
        description: 'The input object containing the meetingId and any modified fields'
      }
    },
    async resolve(source, {updatedMeeting}, {authToken}) {
      const {id, name} = updatedMeeting;
      await requireSUOrTeamMember(authToken, id);
      const meetingFromDB = await r.table('Meeting').get(id).update({
        name
      }, {returnChanges: true});
      // TODO this mutation throws an error, but we don't have a use for it in the app yet
      console.log(meetingFromDB);
      // TODO think hard about if we can pluck only the changed values (in this case, name)
      return updatedOrOriginal(meetingFromDB, updatedMeeting);
    }
  },
  present: {
    description: 'Announce to a presence channel that you are present',
    type: GraphQLBoolean,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The meeting id to announce presence in'
      },
      targetId: {
        type: GraphQLID,
        description: 'The target socketId that wants to know about presence'
      }
    },
    async resolve(source, {meetingId, targetId}, {authToken, exchange, socket}) {
      await requireSUOrTeamMember(authToken, meetingId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);
      const channel = `presence/${meetingId}`;
      // tell targetId that user is in the meeting
      const payload = {type: PRESENT, userId: authToken.sub, socketId: socket.id};
      if (targetId) {
        payload.targetId = targetId;
      }
      exchange.publish(channel, payload);
    }
  },
  soundOff: {
    description: 'A ping request to see who is present in a meeting',
    type: GraphQLBoolean,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      }
    },
    async resolve(source, {meetingId}, {authToken, exchange, socket}) {
      await requireSUOrTeamMember(authToken, meetingId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);
      const channel = `presence/${meetingId}`;
      const soundoff = {type: SOUNDOFF, targetId: socket.id};
      const present = {type: PRESENT, userId: authToken.sub, socketId: socket.id};
      exchange.publish(channel, soundoff);
      exchange.publish(channel, present);
    }
  }
};
