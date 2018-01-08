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
    onCompleted,
    onError
  });
};

export default UpdateCreditCardMutation;
