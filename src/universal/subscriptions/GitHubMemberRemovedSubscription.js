import {leaveIntegrationUpdater} from 'universal/mutations/LeaveIntegrationMutation';

const subscription = graphql`
  subscription GitHubMemberRemovedSubscription($teamId: ID!) {
    githubMemberRemoved(teamId: $teamId) {
      leaveIntegration {
        globalId
        userId
      }
    }
  }
`;

const GitHubMemberRemovedSubscription = (environment, queryVariables) => {
  const {ensureSubscription, viewerId} = environment;
  const {teamId} = queryVariables;
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      store.getRootField('githubMemberRemoved')
        .getLinkedRecords('leaveIntegration')
        .forEach((payload) => {
          leaveIntegrationUpdater(store, viewer, teamId, payload);
        });
    }
  });
};

export default GitHubMemberRemovedSubscription;
