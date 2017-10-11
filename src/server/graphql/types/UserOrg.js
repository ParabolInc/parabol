import {GraphQLID, GraphQLObjectType} from 'graphql';
import OrgUserRole from 'server/graphql/types/OrgUserRoleEnum';


const UserOrg = new GraphQLObjectType({
  name: 'UserOrg',
  description: 'The user/org M:F join, denormalized on the user/org tables',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The orgId'
    },
    role: {
      type: OrgUserRole,
      description: 'role of the user in the org'
    }
  })
});

export default UserOrg;
