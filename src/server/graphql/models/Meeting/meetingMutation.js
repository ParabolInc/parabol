import {Meeting} from './meetingSchema';
import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import uuid from 'node-uuid';
import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';

export default {
  createMeeting: {
    type: Meeting,
    async resolve(source, args, {rootValue}) {
      const {authToken} = rootValue;
      // isLoggedIn(authToken);
      const newMeeting = {
        // TODO: a uuid is overkill. let's make it small for smaller urls & friendly socket payloads
        id: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUpdatedBy: authToken.id,
        // TODO should this be a name? If so we need to add names to the JWT & discuss overall JWT shape
        currentEditors: [],
        content: ''
      }
      await r.table('Meeting').insert(newMeeting);
      return newMeeting;
    }
  },
  editContent: {
    type: Meeting,
    args: {
      meetingId: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
      editor: {type: new GraphQLNonNull(GraphQLString), description: 'the socketId currently editing the content'},
    },
    async resolve(source, {meetingId, editor}, {rootValue}) {
      const {authToken} = rootValue;
      const updatedMeeting = await r.table('Meeting').get(meetingId).update({
        currentEditors: r.row('currentEditors').append(editor)
      }, {returnChanges: true})
      return updatedMeeting.changes[0].new_val;
    }
  },
  finishEditContent: {
    type: Meeting,
    args: {
      meetingId: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
      editor: {type: new GraphQLNonNull(GraphQLString), description: 'the socketId currently editing the content'},
    },
    async resolve(source, {meetingId, editor}, {rootValue}) {
      const {authToken} = rootValue;
      const updatedMeeting = await r.table('Meeting').get(meetingId).update(row => {
        return {
          currentEditors: row('currentEditors').filter(user => user.ne(editor))
        }
      }, {returnChanges: true})
      return updatedMeeting.changes[0].new_val;
    }
  },
  updateContent: {
    type: Meeting,
    args: {
      meetingId: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
      updatedBy: {type: new GraphQLNonNull(GraphQLString), description: 'the socketId that updated the content'},
      content: {type: new GraphQLNonNull(GraphQLBoolean), description: 'the new content'}
    },
    async resolve(source, {meetingId, updatedBy, content}, {rootValue}) {
      const {authToken} = rootValue;

      let updatedMeeting = await r.table('Meeting').get(meetingId).update({
        content,
        lastUpdatedBy: updatedBy
      }, {returnChanges: true})
      return updatedMeeting.changes[0].new_val;
    }
  }
};
