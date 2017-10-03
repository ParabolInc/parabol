import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {BILLING_LEADER} from 'universal/utils/constants';

export default {
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org for which you want the users'
    }
  },
  type: GraphQLBoolean,
  description: 'true if the user is a part of the supplied orgId',
  resolve: (source, {orgId}) => {
    return Boolean(source.userOrgs.find((userOrg) => userOrg.id === orgId && userOrg.role === BILLING_LEADER));
  }
};
