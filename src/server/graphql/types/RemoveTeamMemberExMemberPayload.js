import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveNotification} from 'server/graphql/resolvers';
import Notification from 'server/graphql/types/Notification';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import RemoveTeamMemberPayload, {removeTeamMemberFields} from 'server/graphql/types/RemoveTeamMemberPayload';

const RemoveTeamMemberExMemberPayload = new GraphQLObjectType({
  name: 'RemoveTeamMemberExMemberPayload',
  interfaces: () => [RemoveTeamMemberPayload],
  fields: () => ({
    ...removeTeamMemberFields,
    removedNotifications: {
      type: new GraphQLList(Notification),
      description: 'Any notifications pertaining to the team that are no longer relevant'
    },
    kickOutNotification: {
      type: NotifyKickedOut,
      description: 'A notification if you were kicked out by the team leader',
      resolve: resolveNotification
    }
  })
});

export default RemoveTeamMemberExMemberPayload;
