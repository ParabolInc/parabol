import {requireSUOrTeamMember, requireWebsocketExchange, requireWebsocket} from 'server/utils/authorization';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {EDIT, PRESENCE, PRESENT, SOUNDOFF} from 'universal/subscriptions/constants';

export default {
  edit: {
    description: 'Announce to a presence channel that you are present',
    type: GraphQLBoolean,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team id to announce presence in'
      },
      editing: {
        type: GraphQLID,
        description: 'A normalized object currently being edited by the user'
      }
    },
    async resolve(source, {teamId, editing}, {authToken, exchange, socket}) {
      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);

      // RESOLUTION
      const channel = `${PRESENCE}/${teamId}`;
      // tell targetId that user is in the team
      const payload = {type: EDIT, editing, socketId: socket.id};
      exchange.publish(channel, payload);
    }
  },
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
      },
      editing: {
        type: GraphQLID,
        description: 'A normalized object currently being edited by the user'
      }
    },
    async resolve(source, {teamId, targetId, editing}, {authToken, exchange, socket}) {
      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);

      // RESOLUTION
      const channel = `${PRESENCE}/${teamId}`;
      // tell targetId that user is in the team
      const payload = {type: PRESENT, userId: authToken.sub, socketId: socket.id};
      if (targetId) {
        payload.targetId = targetId;
      }
      if (editing) {
        payload.editing = editing;
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
      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocketExchange(exchange);
      requireWebsocket(socket);

      // RESOLUTION
      const channel = `${PRESENCE}/${teamId}`;
      const soundoff = {type: SOUNDOFF, targetId: socket.id};
      const present = {type: PRESENT, userId: authToken.sub, socketId: socket.id};
      exchange.publish(channel, soundoff);
      exchange.publish(channel, present);
    }
  }
};
