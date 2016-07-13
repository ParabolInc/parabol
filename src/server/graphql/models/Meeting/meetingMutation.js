import r from '../../../database/rethinkDriver';
import {Meeting} from './meetingSchema';
import {errorObj} from '../utils';
import {requireAuth} from '../authorization';

import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export default {
  present: {
    description: 'Annouce to a participant channel that you are present in a particular meeting',
    type: GraphQLID,
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
    async resolve(source, {teamId, userId}, {authToken, exchange, socket}) {
      requireAuth(authToken);
      const teamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).pluck('cachedUserId');
      if (!teamMembers.includes(authToken.sub)) {
        throw errorObj({_error: `You are not a member of team: ${teamId}`});
      }
      if (!teamMembers.includes(userId)) {
        throw errorObj({_error: `user ${userId} is not a part of your team: ${teamId}`});
      }
      if (!socket || !exchange) {
        throw errorObj({_error: 'this must be called from a websocket'});
      }

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
