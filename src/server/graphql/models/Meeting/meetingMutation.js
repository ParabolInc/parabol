import {Meeting} from './meetingSchema';
import r from '../../../database/rethinkDriver';
import uuid from 'node-uuid';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export default {
  createMeeting: {
    type: Meeting,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team ID this meeting belongs to'
      },
    },
    async resolve(source, {teamId}, {authToken}) {
      const newMeeting = {
        // TODO: a uuid is overkill. let's make it small for smaller urls & friendly socket payloads
        id: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUpdatedBy: authToken.id,
        teamId,
        // TODO should this be a name?
        // If so we need to add names to the JWT & discuss overall JWT shape
        currentEditors: [],
        content: ''
      };
      await r.table('Meeting').insert(newMeeting);
      return newMeeting;
    }
  },
  editContent: {
    type: Meeting,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      },
      editor: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the socketId currently editing the content'
      },
    },
    async resolve(source, {meetingId, editor}) { // eslint-disable-line no-unused-vars
      const updatedMeeting = await r.table('Meeting').get(meetingId).update({
        currentEditors: r.row('currentEditors').append(editor)
      }, {returnChanges: true});
      return updatedMeeting.changes[0].new_val;
    }
  },
  finishEditContent: {
    type: Meeting,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      },
      editor: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the socketId currently editing the content'
      },
    },
    async resolve(source, {meetingId, editor}) { // eslint-disable-line no-unused-vars
      const updatedMeeting = await r.table('Meeting').get(meetingId).update(row => ({
        currentEditors: row('currentEditors').filter(user => user.ne(editor))
      }), {returnChanges: true});
      return updatedMeeting.changes[0].new_val;
    }
  },
  updateContent: {
    type: Meeting,
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID'
      },
      updatedBy: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the socketId that updated the content'
      },
      content: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the new content'
      }
    },
    // eslint-disable-next-line no-unused-vars
    async resolve(source, {meetingId, updatedBy, content}) {
      const updatedMeeting = await r.table('Meeting').get(meetingId).update({
        content,
        lastUpdatedBy: updatedBy
      }, {returnChanges: true});
      return updatedMeeting.changes[0].new_val;
    }
  }
};
