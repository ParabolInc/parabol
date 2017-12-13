import {commitMutation} from 'react-relay';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const mutation = graphql`
  mutation ArchiveTeamMutation($teamId: ID!) {
    archiveTeam(teamId: $teamId) {
      team {
        id
      }
    }
  }
`;

export const handleRemoveTeam = (store, viewerId, teamId) => {
  const viewer = store.get(viewerId);
  safeRemoveNodeFromArray(teamId, viewer, 'teams');
};

const ArchiveTeamMutation = (environment, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      handleRemoveTeam(store, viewerId, teamId);
    },
    onCompleted,
    onError
  });
};

export default ArchiveTeamMutation;
