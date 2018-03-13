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
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('githubMemberRemoved');
      if (!payload) return;
      payload.getLinkedRecords('leaveIntegration')
        .forEach((leaveIntegration) => {
          leaveIntegrationUpdater(store, viewer, teamId, leaveIntegration);
        });
    }
  };
};

export default GitHubMemberRemovedSubscription;
