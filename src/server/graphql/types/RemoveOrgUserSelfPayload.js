import {GraphQLList, GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import RemoveOrgUserPayload, {removeOrgUserFields} from 'server/graphql/types/RemoveOrgUserPayload';

const RemoveOrgUserSelfPayload = new GraphQLObjectType({
  name: 'RemoveOrgUserSelfPayload',
  interfaces: () => [RemoveOrgUserPayload],
  fields: () => ({
    ...removeOrgUserFields,
    removedNotifications: {
      type: new GraphQLList(Notification),
      description: 'The notifications that are no longer relevant'
    }
  })
});

export default RemoveOrgUserSelfPayload;
