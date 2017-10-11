import {GraphQLBoolean, GraphQLID, GraphQLObjectType} from 'graphql';
import OrgUserRole from 'server/graphql/types/OrgUserRoleEnum';

const OrgUser = new GraphQLObjectType({
  name: 'OrgUser',
  description: 'The user/org M:F join, denormalized on the user/org tables',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The userId'
    },
    role: {
      type: OrgUserRole,
      description: 'role of the user in the org'
    },
    inactive: {
      type: GraphQLBoolean,
      description: 'true if the user is paused and the orgs are not being billed'
    }
  })
});

export default OrgUser;
