import {GraphQLList, GraphQLObjectType} from 'graphql';
import Invitation from 'server/graphql/types/Invitation';
import InviteTeamMembersPayload, {inviteTeamMembersFields} from 'server/graphql/types/InviteTeamMembersPayload';
import OrgApproval from 'server/graphql/types/OrgApproval';
import TeamMember from 'server/graphql/types/TeamMember';

const InviteTeamMembersAnnouncePayload = new GraphQLObjectType({
  name: 'InviteTeamMembersAnnouncePayload',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  interfaces: () => [InviteTeamMembersPayload],
  fields: () => ({
    ...inviteTeamMembersFields,
    reactivatedTeamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'The list of emails that turned out to be reactivated team members',
      resolve: ({reactivatedTeamMemberIds}, args, {dataLoader}) => {
        if (!reactivatedTeamMemberIds || reactivatedTeamMemberIds.length === 0) return null;
        return dataLoader.get('teamMembers').loadMany(reactivatedTeamMemberIds);
      }
    },
    invitationsSent: {
      type: new GraphQLList(Invitation),
      description: 'The list of invitations successfully sent out',
      resolve: ({invitationIds}, args, {dataLoader}) => {
        if (!invitationIds || invitationIds.length === 0) return null;
        return dataLoader.get('invitations').loadMany(invitationIds);
      }
    },
    orgApprovalsSent: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of orgApprovals sent to the org leader',
      resolve: ({orgApprovalIds}, args, {dataLoader}) => {
        if (!orgApprovalIds || orgApprovalIds.length === 0) return null;
        return dataLoader.get('orgApprovals').loadMany(orgApprovalIds);
      }
    },
    orgApprovalsRemoved: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of orgApprovals removed. Triggered if An org leader invites someone with a pending approval',
      resolve: ({removedOrgApprovalIds}, args, {dataLoader}) => {
        if (!removedOrgApprovalIds || removedOrgApprovalIds.length === 0) return null;
        return dataLoader.get('orgApprovals').loadMany(removedOrgApprovalIds);
      }
    }
  })
});

export default InviteTeamMembersAnnouncePayload;
