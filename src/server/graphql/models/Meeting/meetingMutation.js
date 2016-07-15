import r from '../../../database/rethinkDriver';
import {errorObj} from '../utils';
import {requireAuth, requireSUOrTeamMember, requireWebsocketExchange} from '../authorization';
import {requireSUOrTeamMember, requireSUOrSelf} from '../authorization';
import {updatedOrOriginal} from '../utils';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import {SOUNDOFF, CreateMeetingInput, UpdateMeetingInput, Meeting} from './meetingSchema';

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
    description: 'Announce to a participant channel that you are present in a particular meeting',
    type: GraphQLBoolean,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The meeting ID'
      },
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The userId that wants to know your status'
      }
    },
    async resolve(source, {meetingId, userId}, {authToken, exchange}) {
      requireAuth(authToken);
      requireWebsocketExchange(exchange);
      const teamMembers = await r.table('TeamMember').getAll(meetingId, {index: 'meetingId'}).pluck('userId');
      if (!teamMembers.includes(authToken.sub)) {
        throw errorObj({_error: `You are not a member of meeting: ${meetingId}`});
      }
      if (!teamMembers.includes(userId)) {
        throw errorObj({_error: `user ${userId} is not a part of your meeting: ${meetingId}`});
      }
      const channel = `participant/${userId}`;
      const payload = {
        meetingId,
        user: authToken.sub
      };
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
    async resolve(source, {meetingId}, {authToken, exchange}) {
      await requireSUOrTeamMember(authToken, meetingId);
      requireWebsocketExchange(exchange);
      const channel = `presence/${meetingId}`;
      // who wants to know? this guy
      const payload = {type: SOUNDOFF, user: authToken.sub};
      exchange.publish(channel, payload);
    }
  }
};
