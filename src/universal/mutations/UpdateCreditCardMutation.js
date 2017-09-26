import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateCreditCardMutation($orgId: ID!, $stripeToken: ID!) {
    updateCreditCard(orgId: $orgId, stripeToken: $stripeToken) {
      creditCard {
        brand
        last4
        expiry
      }
    }
  }
`;

const UpdateCreditCardMutation = (environment, orgId, stripeToken, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {
      orgId,
      stripeToken
    },
    // updater: (store) => {
    //  const slackIntegration = store.getRootField('updateCreditCard').getLinkedRecord('creditCard');
    //  const [, teamId] = teamMemberId.split('::');
    //  addSlackChannelUpdater(store, viewerId, teamId, slackIntegration);
    // }
    onCompleted,
    onError
  });
};

export default UpdateCreditCardMutation;
