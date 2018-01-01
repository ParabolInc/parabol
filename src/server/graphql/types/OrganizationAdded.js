import {GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import Organization from 'server/graphql/types/Organization';

const OrganizationAdded = new GraphQLObjectType({
  name: 'OrganizationAdded',
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

export default OrganizationAdded;
