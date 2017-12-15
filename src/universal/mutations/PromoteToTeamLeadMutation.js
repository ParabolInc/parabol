import {commitMutation} from 'react-relay';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const mutation = graphql`
  mutation PromoteToTeamLeadMutation($teamMemberId: ID!) {
    promoteToTeamLead(teamMemberId: $teamMemberId) {
      teamMember {
        isLead
      }
    }
  }
`;

const PromoteToTeamLeadMutation = (environment, teamMemberId, onError, onCompleted) => {
  const {teamId} = fromTeamMemberId(teamMemberId);
  const myTeamMemberId = toTeamMemberId(teamId, environment.userId);
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    updater: (store) => {
      store.get(myTeamMemberId).setValue(false, 'isLead');
    },
    optimisticUpdater: (store) => {
      store.get(myTeamMemberId).setValue(false, 'isLead');
      store.get(teamMemberId).setValue(true, 'isLead');
    },
    onCompleted,
    onError
  });
};

export default PromoteToTeamLeadMutation;
