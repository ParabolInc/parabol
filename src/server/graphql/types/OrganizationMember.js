import {GraphQLBoolean, GraphQLID, GraphQLObjectType} from 'graphql';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import {resolveOrganization, resolveUser} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import User from 'server/graphql/types/User';
import {BILLING_LEADER} from 'universal/utils/constants';
import toOrgMemberId from 'universal/utils/relay/toOrgMemberId';

const OrganizationMember = new GraphQLObjectType({
  name: 'OrganizationMember',
  fields: () => ({
    id: {
      type: GraphQLID,
      resolve: ({orgId, userId}) => toOrgMemberId(orgId, userId)
    },
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    user: {
      type: User,
      resolve: resolveUser
    },
    isBillingLeader: {
      type: GraphQLBoolean,
      resolve: async ({orgId, userId}, args, {dataLoader}) => {
        const user = await dataLoader.get('users').load(userId);
        return Boolean(user.userOrgs.find((userOrg) => userOrg.id === orgId && userOrg.role === BILLING_LEADER));
      }
    }
  })
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: OrganizationMember
});

export const OrganizationMemberConnection = connectionType;
export const OrganizationMemberEdge = edgeType;
export default OrganizationMember;
