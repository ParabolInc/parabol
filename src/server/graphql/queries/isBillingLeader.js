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
  resolve: async (source, {orgId}, {dataLoader}) => {
    const {id: userId} = source;
    const user = await dataLoader.get('users').load(userId);
    return Boolean(user.userOrgs.find((userOrg) => userOrg.id === orgId && userOrg.role === BILLING_LEADER));
  }
};
