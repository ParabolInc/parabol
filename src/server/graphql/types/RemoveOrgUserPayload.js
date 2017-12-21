import {GraphQLList, GraphQLObjectType} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import OrgApproval from 'server/graphql/types/OrgApproval';
import TeamMember from 'server/graphql/types/TeamMember';

const RemoveOrgUserPayload = new GraphQLObjectType({
  name: 'RemoveOrgUserPayload',
  fields: () => ({
    inactivatedOrgApprovals: {
      type: new GraphQLList(OrgApproval)
    },
    organization: {
      type: Organization
    },
    teamMembersRemoved: {
      type: new GraphQLList(TeamMember)
    }
  })
});

export default RemoveOrgUserPayload;
