import {commitMutation} from 'react-relay';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

graphql`
  fragment PromoteToTeamLeadMutation_teamMember on PromoteToTeamLeadPayload {
    oldTeamLead {
      isLead
    }
    newTeamLead {
      isLead
    }
  }
`;

const mutation = graphql`
  mutation PromoteToTeamLeadMutation($teamMemberId: ID!) {
    promoteToTeamLead(teamMemberId: $teamMemberId) {
      ...PromoteToTeamLeadMutation_teamMember
    }
  }
`;

const PromoteToTeamLeadMutation = (environment, teamMemberId, onError, onCompleted) => {
  const {teamId} = fromTeamMemberId(teamMemberId);
  const myTeamMemberId = toTeamMemberId(teamId, environment.userId);
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    optimisticUpdater: (store) => {
      store.get(myTeamMemberId).setValue(false, 'isLead');
      store.get(teamMemberId).setValue(true, 'isLead');
    },
    onCompleted,
    onError
  });
};

export default PromoteToTeamLeadMutation;
