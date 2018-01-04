import {approveToOrgOrgApprovalUpdater} from 'universal/mutations/ApproveToOrgMutation';
import {cancelApprovalOrgApprovalUpdater} from 'universal/mutations/CancelApprovalMutation';
import {inviteTeamMembesrOrgApprovalUpdater} from 'universal/mutations/InviteTeamMembersMutation';

// ... on OrgApprovalAdded {
//  orgApproval {
//  ...CompleteOrgApprovalFrag @relay(mask: false)
//  }
// }
// ... on OrgApprovalRemoved {
//  orgApproval {
//    id
//  }
// }

const subscription = graphql`
  subscription OrgApprovalSubscription($teamId: ID!) {
    orgApprovalSubscription(teamId: $teamId) {
      __typename
      ...ApproveToOrgMutation_orgApproval
      ...CancelApprovalMutation_orgApproval
      ...InviteTeamMembersMutation_orgApproval
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
        case 'InviteTeamMembersPayload':
          inviteTeamMembesrOrgApprovalUpdater(payload, store);
          break;
        default:
          console.error('OrgApprovalSubscription case fail', type);
      }


      // const orgApproval = payload.getLinkedRecord('orgApproval');
      // if (type === 'OrgApprovalAdded') {
      //  handleAddOrgApprovals(orgApproval, store);
      // } else if (type === 'OrgApprovalRemoved') {
      //  const orgApprovalId = getInProxy(orgApproval, 'id');
      //  handleRemoveOrgApprovals(orgApprovalId, store);
      // }
    }
  };
};

export default OrgApprovalSubscription;
