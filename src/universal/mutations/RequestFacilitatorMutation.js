import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment RequestFacilitatorMutation_team on RequestFacilitatorPayload {
    requestor {
      id
      name
    }
  }
`;

const mutation = graphql`
  mutation RequestFacilitatorMutation($teamId: ID!) {
    requestFacilitator(teamId: $teamId) {
      ...RequestFacilitatorMutation_team @relay(mask: false)
    }
  }
`;

export const requestFacilitatorTeamUpdater = (payload, {dispatch, environment}) => {
  const requestorId = getInProxy(payload, 'requestor', 'id');
  if (!requestorId) return;
  const requestorName = getInProxy(payload, 'requestor', 'preferredName');
  dispatch(showInfo({
    title: `${requestorName} wants to facilitate`,
    message: 'Tap ‘Promote’ to hand over the reins',
    autoDismiss: 0,
    action: {
      label: 'Promote',
      callback: () => {
        PromoteFacilitatorMutation(environment, {facilitatorId: requestorId}, dispatch);
      }
    }
  }));
};

const RequestFacilitatorMutation = (environment, teamId) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId}
  });
};

export default RequestFacilitatorMutation;
