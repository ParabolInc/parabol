import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateTeamNameMutation($updatedTeam: UpdatedTeamInput!) {
    updateTeamName(updatedTeam: $updatedTeam) {
      team {
        name
      }
    }
  }
`;

const UpdateTeamNameMutation = (environment, updatedTeam, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {updatedTeam},
    optimisticUpdater: (store) => {
      const {id: teamId, name: teamName} = updatedTeam;
      store.get(teamId).setValue(teamName, 'name');
    },
    onCompleted,
    onError
  });
};

export default UpdateTeamNameMutation;
