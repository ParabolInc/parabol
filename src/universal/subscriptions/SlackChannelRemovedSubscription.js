import {removeSlackChannelUpdater} from 'universal/mutations/RemoveSlackChannelMutation';

const RemovedSubscription = graphql`
  subscription SlackChannelRemovedSubscription($teamId: ID!) {
    slackChannelRemoved(teamId: $teamId) {
      deletedId
    }
  }
`;

const SlackChannelRemovedSubscription = (teamId, viewerId) => (ensureSubscription) => {
  return ensureSubscription({
    subscription: RemovedSubscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const removedChannel = store.getRootField('slackChannelRemoved');
      const deletedId = removedChannel.getValue('deletedId');
      removeSlackChannelUpdater(viewer, teamId, deletedId);
    }
  })
};

export default SlackChannelRemovedSubscription;
