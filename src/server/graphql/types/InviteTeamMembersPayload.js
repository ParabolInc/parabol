import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import Invitation from 'server/graphql/types/Invitation';
import InvitationResult from 'server/graphql/types/InvitationResult';
import OrgApproval from 'server/graphql/types/OrgApproval';
import TeamMember from 'server/graphql/types/TeamMember';

const InviteTeamMembersPayload = new GraphQLObjectType({
  name: 'InviteTeamMembersPayload',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  fields: () => ({
    results: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(InvitationResult))),
      description: 'a list of the emails invited & the results from the invitation'
    },
    reactivatedTeamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'The list of emails that turned out to be reactivated team members',
      resolve: ({reactivatedTeamMemberIds}, args, {dataLoader}) => {
        return dataLoader.get('teamMembers').loadMany(reactivatedTeamMemberIds);
      }
    },
    invitationsSent: {
      type: new GraphQLList(Invitation),
      description: 'The list of invitations successfully sent out',
      resolve: ({invitationIds}, args, {dataLoader}) => {
        return dataLoader.get('invitations').loadMany(invitationIds);
      }
    },
    orgApprovalsSent: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of orgApprovals sent to the org leader',
      resolve: ({orgApprovalIds}, args, {dataLoader}) => {
        return dataLoader.get('orgApprovals').loadMany(orgApprovalIds);
      }
    },
    errors: {
      type: new GraphQLList(GraphQLEmailType),
      description: 'The list of emails already on the team'
    }
  })
});

export default InviteTeamMembersPayload;
