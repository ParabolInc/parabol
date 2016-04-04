import {Meeting} from './meetingSchema';
import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import uuid from 'node-uuid';

export default {
  createMeeting: {
    type: Meeting,
    async resolve(source, args, {rootValue}) {
      const {authToken} = rootValue;
      // isLoggedIn(authToken);
      const newMeeting = {
        id: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // TODO should this be a name? If so we need to add names to the JWT & discuss overall JWT shape
        updatedBy: authToken.id,
        content: '',
        editing: false
      }
      await r.table('Meeting').insert(newMeeting);
      return newMeeting;
    }
  }
};
