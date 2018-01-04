import {GraphQLList, GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import RemoveTeamMemberPayload, {removeTeamMemberFields} from 'server/graphql/types/RemoveTeamMemberPayload';

const RemoveTeamMemberSelfPayload = new GraphQLObjectType({
  name: 'RemoveTeamMemberSelfPayload',
  interfaces: () => [RemoveTeamMemberPayload],
  fields: () => ({
    ...removeTeamMemberFields,
    removedNotifications: {
      type: new GraphQLList(Notification),
      description: 'Any notifications pertaining to the team that are no longer relevant'
    }
  })
});

export default RemoveTeamMemberSelfPayload;
