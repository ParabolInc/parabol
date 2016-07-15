import r from '../../../database/rethinkDriver';
import {getRequestedFields} from '../utils';
import {Meeting} from './meetingSchema';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import {requireSUOrTeamMember, requireWebsocketExchange} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  meeting: {
    type: Meeting,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      }
    },
    async resolve(source, {meetingId}, {authToken, socket, subbedChannelName}, refs) {
      // Assumes meetingId === meetingId
      requireSUOrTeamMember(authToken, meetingId);
      // eslint-disable-next-line no-unused-vars
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Meeting')
        .get(meetingId)
        // point changefeeds don't support pluck yet https://github.com/rethinkdb/rethinkdb/issues/3623
        .changes({includeInitial: true})
        .map(row => ({
          new_val: row('new_val').default({}).pluck(requestedFields),
          old_val: row('old_val').default({}).pluck(requestedFields)
        }))
        .run({cursor: true}, changefeedHandler);
    }
  },
  presence: {
    description: 'Listen for new folks to join a specified meeting & when they call `soundOff`, respond with `present`',
    type: GraphQLID,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      }
    },
    resolve(source, {meetingId}, {authToken, exchange, socket}) {
      requireSUOrTeamMember(authToken, meetingId);
      requireWebsocketExchange(exchange);
      const channel = `presence/${meetingId}`;
      console.log('resolving presence');
      socket.on('message', message => {
        if (message === '#2') return;
        console.log('SOCKET FROM GQL SAYS:', message);
      });
      socket.on(channel, (data, res) => {
        console.log(`listening on channel ${channel}. yay! the data are ${data}`);
      });
    }
  }
};
