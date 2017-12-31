import {commitMutation} from 'react-relay';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!, $invitees: [Invitee!]) {
    addTeam(newTeam: $newTeam, invitees: $invitees) {
      team {
        ...CompleteTeamFragWithMembers @relay(mask: false)
      }
    }
  }
`;

const AddTeamMutation = (environment, newTeam, invitees, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newTeam, invitees},
    updater: (store) => {
      const payload = store.getRootField('addTeam');
      const team = payload.getLinkedRecord('team');
      handleAddTeams(team, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const team = createProxyRecord(store, 'Team', {...newTeam, isPaid: true});
      handleAddTeams(team, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default AddTeamMutation;
