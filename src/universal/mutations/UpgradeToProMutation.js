import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpgradeToProMutation($orgId: ID!, $stripeToken: ID!) {
    upgradeToPro(orgId: $orgId, stripeToken: $stripeToken) {
      organization {
        creditCard {
          brand
          last4
          expiry
        }
        tier
        periodEnd
        periodStart
        updatedAt
      }
      teams {
        isPaid
        tier
      }
    }
  }
`;

const UpgradeToProMutation = (environment, orgId, stripeToken, onError, onCompleted) => {
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

export default UpgradeToProMutation;
