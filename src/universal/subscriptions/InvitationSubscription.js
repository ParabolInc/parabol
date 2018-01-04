import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';
import getInProxy from 'universal/utils/relay/getInProxy';

const subscription = graphql`
  subscription InvitationSubscription($teamId: ID!) {
    invitationSubscription(teamId: $teamId) {
      __typename
      ...on InvitationAdded {
        invitation {
          ...CompleteInvitationFrag @relay(mask: false)
        }  
      }
      ... on InvitationUpdated {
        invitation {
          ...CompleteInvitationFrag @relay(mask: false)
        }
      }
      ... on InvitationRemoved {
        invitation {
          id
        }
      }
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
      const invitation = payload.getLinkedRecord('invitation');
      const type = payload.getLinkedRecord('__typename');
      if (type === 'InvitationAdded') {
        handleAddInvitations(invitation, store);
      } else if (type === 'InvitationRemoved') {
        const invitationId = getInProxy(invitation, 'id');
        handleRemoveInvitations(invitationId, store, teamId);
      }
    }
  };
};

export default InvitationSubscription;
