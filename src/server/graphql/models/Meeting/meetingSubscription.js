import r from '../../../database/rethinkDriver';
import {getFields, handleRethinkChangefeed} from '../utils';
import {Meeting} from './meetingSchema';
import {GraphQLNonNull, GraphQLID} from 'graphql';

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
      // eslint-disable-next-line no-unused-vars
      const requestedFields = Object.keys(getFields(refs));
      // const mapper = handleRethinkChangefeed(requestedFields);
      const fields = r.expr(requestedFields);
      r.table('Meeting')
        .get(meetingId)
        // point changefeeds don't support pluck yet https://github.com/rethinkdb/rethinkdb/issues/3623
        .changes({includeInitial: true})
        // .filter(row => fields.contains(field => {
        //   return row('new_val')(field).ne(row('old_val')(field)).default(true);
        // }))
        .map(row => ({
          new_val: row('new_val').default({}).pluck(fields),
          old_val: row('old_val').default({}).pluck(fields)
        }))
        .run({cursor: true}, (err, cursor) => {
          if (err) throw err;
          cursor.each((error, data) => {
            if (error) throw error;
            const formattedData = handleRethinkChangefeed(data);
            console.log('emitting meeting data', subbedChannelName, formattedData)
            socket.emit(subbedChannelName, formattedData);
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
