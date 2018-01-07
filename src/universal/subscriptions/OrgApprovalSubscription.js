import {approveToOrgOrgApprovalUpdater} from 'universal/mutations/ApproveToOrgMutation';
import {cancelApprovalOrgApprovalUpdater} from 'universal/mutations/CancelApprovalMutation';
import {inviteTeamMembesrOrgApprovalUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {rejectOrgApprovalOrgApprovalUpdater} from 'universal/mutations/RejectOrgApprovalMutation';

const subscription = graphql`
  subscription OrgApprovalSubscription($teamId: ID!) {
    orgApprovalSubscription(teamId: $teamId) {
      __typename
      ...ApproveToOrgMutation_orgApproval
      ...CancelApprovalMutation_orgApproval
      ...InviteTeamMembersMutationAnnounce_orgApproval
      ...RejectOrgApprovalMutation_orgApproval
    }
  }
`;

const OrgApprovalSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('orgApprovalSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'ApproveToOrgPayload':
          approveToOrgOrgApprovalUpdater(payload, store);
          break;
        case 'CancelApprovalPayload':
          cancelApprovalOrgApprovalUpdater(payload, store);
          break;
        case 'InviteTeamMembersAnnouncePayload':
          inviteTeamMembesrOrgApprovalUpdater(payload, store);
          break;
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalOrgApprovalUpdater(payload, store);
          break;
        default:
          console.error('OrgApprovalSubscription case fail', type);
      }
    }
  };
};

export default OrgApprovalSubscription;
