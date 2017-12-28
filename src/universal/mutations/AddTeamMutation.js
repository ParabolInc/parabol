import {commitMutation} from 'react-relay';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!, $invitees: [Invitee!]) {
    addTeam(newTeam: $newTeam, invitees: $invitees) {
      team {
        id
        isPaid
        name
      }
    }
  }
`;

export const handleAddTeamToViewerTeams = (store, viewerId, newNode) => {
  const viewer = store.get(viewerId);
  addNodeToArray(newNode, viewer, 'teams', 'name');
};

const AddTeamMutation = (environment, newTeam, invitees, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newTeam, invitees},
    updater: (store) => {
      const payload = store.getRootField('addTeam');
      const team = payload.getLinkedRecord('team');
      handleAddTeamToViewerTeams(store, viewerId, team);
    },
    optimisticUpdater: (store) => {
      const team = createProxyRecord(store, 'Team', {...newTeam, isPaid: true});
      handleAddTeamToViewerTeams(store, viewerId, team);
    },
    onCompleted,
    onError
  });
};

export default AddTeamMutation;
