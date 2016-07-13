import r from '../../../database/rethinkDriver';
import {errorObj} from '../utils';
import {requireAuth, requireSUOrTeamMember, requireWebsocketExchange} from '../authorization';
import {SOUNDOFF} from './meetingSchema';

import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';

export default {
  present: {
    description: 'Announce to a participant channel that you are present in a particular meeting',
    type: GraphQLBoolean,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team ID this meeting belongs to'
      },
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The cachedUserId that wants to know your status'
      }
    },
    async resolve(source, {teamId, userId}, {authToken, exchange}) {
      requireAuth(authToken);
      requireWebsocketExchange(exchange);
      const teamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).pluck('cachedUserId');
      if (!teamMembers.includes(authToken.sub)) {
        throw errorObj({_error: `You are not a member of team: ${teamId}`});
      }
      if (!teamMembers.includes(userId)) {
        throw errorObj({_error: `user ${userId} is not a part of your team: ${teamId}`});
      }
      const channel = `participant/${userId}`;
      const payload = {
        teamId,
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
      console.log('resolve has exchange', !!exchange)
      console.log('resolving soundOff');
      requireSUOrTeamMember(authToken, meetingId);
      requireWebsocketExchange(exchange);
      const channel = `presence/${meetingId}`;
      // who wants to know? this guy
      const payload = {type: SOUNDOFF, user: authToken.sub};
      console.log('pub soundOff');
      exchange.publish(channel, payload);
    }
  }
};
