import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment PromoteFacilitatorMutation_team on PromoteFacilitatorPayload {
    team {
      activeFacilitator
    }
    disconnectedFacilitator {
      preferredName
    }
    newFacilitator {
      preferredName
      userId
    }
  }
`;

const mutation = graphql`
  mutation PromoteFacilitatorMutation($facilitatorId: ID!, $disconnectedFacilitatorId: ID) {
    promoteFacilitator(facilitatorId: $facilitatorId, disconnectedFacilitatorId: $disconnectedFacilitatorId) {
      ...PromoteFacilitatorMutation_team @relay(mask: false)
    }
  }
`;

const popFacilitatorDisconnectedToast = (payload, viewerId, dispatch) => {
  const oldFacilitatorName = getInProxy(payload, 'oldFacilitator', 'preferredName');
  // Don't toast changes, only disconnects
  if (!oldFacilitatorName) return;

  const newFacilitatorName = getInProxy(payload, 'newFacilitator', 'preferredName');
  const newFacilitatorUserId = getInProxy(payload, 'newFacilitator', 'userId');
  const facilitatorIntro = viewerId === newFacilitatorUserId ? 'You are' : `${newFacilitatorName} is`;
  dispatch(showInfo({
    title: `${oldFacilitatorName} Disconnected!`,
    message: `${facilitatorIntro} the new facilitator`
  }));
};

export const promoteFacilitatorTeamUpdater = (payload, viewerId, dispatch) => {
  popFacilitatorDisconnectedToast(payload, viewerId, dispatch);
};

const PromoteFacilitatorMutation = (environment, variables, dispatch, onError, onCompleted) => {
  const {facilitatorId} = variables;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('promoteFacilitator');
      promoteFacilitatorTeamUpdater(payload, dispatch);
    },
    optimisticUpdater: (store) => {
      const [, teamId] = facilitatorId.split('::');
      store.get(teamId)
        .setValue(facilitatorId, 'activeFacilitator');
    },
    onCompleted,
    onError
  });
};

export default PromoteFacilitatorMutation;
