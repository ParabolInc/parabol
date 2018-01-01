import {GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import Organization from 'server/graphql/types/Organization';

const OrganizationRemoved = new GraphQLObjectType({
  name: 'OrganizationRemoved',
  fields: () => ({
    organization: {
      type: Organization
    },
    notification: {
      // TODO fix
      type: Notification
    }
  })
});

export default OrganizationRemoved;
