import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';

graphql`
  fragment PromoteNewMeetingFacilitatorMutation_team on PromoteNewMeetingFacilitatorPayload {
    meeting {
      facilitatorUserId
      facilitator {
        id
        preferredName
      }
    }
    oldFacilitator {
      isConnected
      preferredName
    }
  }
`;

const mutation = graphql`
  mutation PromoteNewMeetingFacilitatorMutation($facilitatorUserId: ID!, $meetingId: ID!) {
    promoteNewMeetingFacilitator(facilitatorUserId: $facilitatorUserId, meetingId: $meetingId) {
      error {
        message
      }
      ...PromoteNewMeetingFacilitatorMutation_team @relay(mask: false)
    }
  }
`;

export const promoteNewMeetingFacilitatorTeamOnNext = (payload, context) => {
  const {environment, dispatch} = context;
  const {viewerId} = environment;
  const {oldFacilitator, meeting} = payload;
  const {isConnected, preferredName: oldFacilitatorName} = oldFacilitator;
  const {facilitator: {preferredName: newFacilitatorName, id: newFacilitatorUserId}} = meeting;
  const isSelf = newFacilitatorUserId === viewerId;
  const title = isConnected ? 'New facilitator!' : `${oldFacilitatorName} disconnected!`;
  const intro = isSelf ? 'You are' : `${newFacilitatorName} is`;
  dispatch(showInfo({
    title,
    message: `${intro} the new facilitator`
  }));
};

const PromoteNewMeetingFacilitatorMutation = (environment, variables, {dispatch}, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, facilitatorUserId} = variables;
      store.get(meetingId)
        .setValue(facilitatorUserId, 'facilitatorUserId');
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors);
      }
      promoteNewMeetingFacilitatorTeamOnNext(res.promoteNewMeetingFacilitator, {dispatch, environment});
    },
    onError
  });
};

export default PromoteNewMeetingFacilitatorMutation;
