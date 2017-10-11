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
    // updater: (store) => {
    //  const slackIntegration = store.getRootField('updateCreditCard').getLinkedRecord('creditCard');
    //  const [, teamId] = teamMemberId.split('::');
    //  addSlackChannelUpdater(store, viewerId, teamId, slackIntegration);
    // }
    onCompleted,
    onError
  });
};

export default UpgradeToProMutation;
