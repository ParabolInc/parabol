import {handleRemoveInvitation} from 'universal/mutations/CancelTeamInviteMutation';

const subscription = graphql`
  subscription InvitationRemovedSubscription($teamId: ID!) {
    invitationRemoved(teamId: $teamId) {
      invitation {
        id
      }
    }
  }
`;

const InvitationRemovedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const invitationId = store.getRootField('invitationRemoved')
        .getLinkedRecord('invitation')
        .getValue('id');
      handleRemoveInvitation(store, teamId, invitationId);
    }
  };
};

export default InvitationRemovedSubscription;
