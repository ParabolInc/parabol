import r from '../../../database/rethinkDriver';
import {getFields} from '../utils';
import {Meeting} from './meetingSchema';
import {GraphQLNonNull, GraphQLID} from 'graphql';

export default {
  getMeeting: {
    type: Meeting,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      }
    },
    async resolve(source, {meetingId}, refs) {
      const {rootValue} = refs;
      // eslint-disable-next-line no-unused-vars
      const {socket, authToken, subbedChannelName} = rootValue;
      const requestedFields = Object.keys(getFields(refs));
      // isLoggedIn(rootValue);
      r.table('Meeting')
        .get(meetingId)
        // point changefeeds don't support pluck yet https://github.com/rethinkdb/rethinkdb/issues/3623
        // .pluck(requestedFields)
        // TODO change this to a 1 time query
        // instead of includeInitial so we can use the socket.publish?
        .changes({includeInitial: true})
        .map(row => ({new_val: row('new_val').pluck(requestedFields)}))
        .run({cursor: true}, (err, cursor) => {
          if (err) {
            throw err;
          }
          cursor.each((error, data) => {
            if (error) {
              throw error;
            }
            const docId = data.new_val.id;
            if (socket.docQueue.has(docId)) {
              // don't bother sending it back to the originator,
              // they were already optimistically updated
              socket.docQueue.delete(docId);
            } else {
              socket.emit(subbedChannelName, data.new_val);
            }
          });
          socket.on('unsubscribe', channelName => {
            if (channelName === subbedChannelName) {
              cursor.close();
            }
          });
        });
    }
  }
};
