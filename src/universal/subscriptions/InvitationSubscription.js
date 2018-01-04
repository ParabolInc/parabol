import {approveToOrgInvitationUpdater} from 'universal/mutations/ApproveToOrgMutation';

// ...on InvitationAdded {
// ...CompleteInvitationFrag @relay(mask: false)
// }
// }
// ... on InvitationUpdated {
//  invitation {
//  ...CompleteInvitationFrag @relay(mask: false)
//  }
// }
// ... on InvitationRemoved {
//  invitation {
//    id
//  }
// }

const subscription = graphql`
  subscription InvitationSubscription($teamId: ID!) {
    invitationSubscription(teamId: $teamId) {
      __typename
      ...ApproveToOrgMutation_invitation      
    }
  }
`;

const InvitationSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('invitationSubscription');
      const type = payload.getLinkedRecord('__typename');
      switch (type) {
        case 'ApproveToOrgPayload':
          approveToOrgInvitationUpdater(payload, store);
          break;
        default:
          console.error('InvitationSubscription case fail', type);
      }

      // const invitation = payload.getLinkedRecord('invitation');
      // if (type === 'InvitationAdded') {
      //  handleAddInvitations(invitation, store);
      // } else if (type === 'InvitationRemoved') {
      //  const invitationId = getInProxy(invitation, 'id');
      //  handleRemoveInvitations(invitationId, store, teamId);
      // }
    }
  };
};

export default InvitationSubscription;
