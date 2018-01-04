import {commitMutation} from 'react-relay';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

graphql`
  fragment AddTeamMutation_team on AddTeamPayload {
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`;

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!, $invitees: [Invitee!]) {
    addTeam(newTeam: $newTeam, invitees: $invitees) {
      ...AddTeamMutation_team @relay(mask: false)
    }
  }
`;

export const addTeamTeamUpdater = (payload, store, viewerId) => {
  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);
};

const AddTeamMutation = (environment, newTeam, invitees, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newTeam, invitees},
    updater: (store) => {
      const payload = store.getRootField('addTeam');
      addTeamTeamUpdater(payload, store, viewerId);
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
