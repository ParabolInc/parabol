import {removeSlackChannelUpdater} from 'universal/mutations/RemoveSlackChannelMutation';

const subscription = graphql`
  subscription SlackChannelRemovedSubscription($teamId: ID!) {
    slackChannelRemoved(teamId: $teamId) {
      deletedId
    }
  }
`;

const SlackChannelRemovedSubscription = (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const removedChannel = store.getRootField('slackChannelRemoved');
      const deletedId = removedChannel.getValue('deletedId');
      removeSlackChannelUpdater(viewer, teamId, deletedId);
    }
  };
};

export default SlackChannelRemovedSubscription;
