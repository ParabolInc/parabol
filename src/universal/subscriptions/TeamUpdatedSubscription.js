import {handleRemoveTeam} from 'universal/mutations/ArchiveTeamMutation';

const subscription = graphql`
  subscription TeamUpdatedSubscription {
    teamUpdated {
      team {
        id
        name
        isPaid
        meetingId
        isArchived
      }
    }
  }
`;

const TeamUpdatedSubscription = (environment) => {
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const team = store.getRootField('teamUpdated').getLinkedRecord('team');
      const isArchived = team.getValue('isArchived');
      // this is way easier than setting up a 2nd channel for teamRemoved
      if (isArchived) {
        const teamId = team.getValue('id');
        handleRemoveTeam(store, viewerId, teamId);
      }
    }
  };
};

export default TeamUpdatedSubscription;
