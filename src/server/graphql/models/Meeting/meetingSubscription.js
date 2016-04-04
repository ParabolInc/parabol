import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Meeting} from './meetingSchema';

export default {
  getMeeting: {
    type: Meeting,
    async resolve(source, {meetingId}, refs) {
      const {rootValue} = refs;
      const {socket, authToken, channelName: subbedChannelName} = rootValue;
      const requestedFields = Object.keys(getFields(refs));
      // isLoggedIn(rootValue);
      r.table('Meeting')
        .get(meetingId)
        .pluck(requestedFields)
        // change this to a 1 time query instead of includeInitial so we can use the socket.publish
        .changes({includeInitial: true})
        .run({cursor: true}, (err, cursor) => {
          if (err) {
            throw err;
          }
          cursor.each((err, data) => {
            if (err) {
              throw err;
            }
            const docId = data.new_val.id;
            if (socket.docQueue.has(docId)) {
              // don't bother sending it back to the originator, they were already optimistically updated
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
