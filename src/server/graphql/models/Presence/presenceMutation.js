import {requireSUOrTeamMember, requireWebsocketExchange, requireWebsocket} from '../authorization';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import {SOUNDOFF, PRESENT} from 'universal/subscriptions/constants';

export default {
  present: {
    description: 'Announce to a presence channel that you are present',
    type: GraphQLBoolean,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team id to announce presence in'
      },
      targetId: {
        type: GraphQLID,
        description: 'The target socketId that wants to know about presence'
      }
    },
    async resolve(source, {teamId, targetId}, {authToken, exchange, socket}) {
      await requireSUOrTeamMember(authToken, teamId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);
      const channel = `presence/${teamId}`;
      // tell targetId that user is in the team
      const payload = {type: PRESENT, userId: authToken.sub, socketId: socket.id};
      if (targetId) {
        payload.targetId = targetId;
      }
      exchange.publish(channel, payload);
    }
  },
  soundOff: {
    description: 'A ping request to see who is present in a team',
    type: GraphQLBoolean,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID'
      }
    },
    async resolve(source, {teamId}, {authToken, exchange, socket}) {
      await requireSUOrTeamMember(authToken, teamId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);
      const channel = `presence/${teamId}`;
      const soundoff = {type: SOUNDOFF, targetId: socket.id};
      const present = {type: PRESENT, userId: authToken.sub, socketId: socket.id};
      exchange.publish(channel, soundoff);
      exchange.publish(channel, present);
    }
  }
};
