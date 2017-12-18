import {GraphQLID, GraphQLInterfaceType} from 'graphql';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import Invitation from 'server/graphql/types/Invitation';
import OrgApproval from 'server/graphql/types/OrgApproval';
import TeamMember from 'server/graphql/types/TeamMember';

export const possibleTeamMemberInterfaceFields = {
  id: {
    type: GraphQLID,
    description: 'A shortid for the possible team member'
  },
  email: {
    type: GraphQLEmailType,
    description: 'The email invited (if Invitee or OrgApproval) or used'
  }
};

const PossibleTeamMember = new GraphQLInterfaceType({
  name: 'PossibleTeamMember',
  fields: () => possibleTeamMemberInterfaceFields,
  resolveType(value) {
    if (value.userId) return TeamMember;
    if (value.orgId) return OrgApproval;
    if (value.tokenExpiration) return Invitation;
    return undefined;
  }
});

export default PossibleTeamMember;
