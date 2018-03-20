import {commitLocalUpdate, commitMutation} from 'react-relay';
import {setLocalStageAndPhase} from 'universal/utils/relay/updateLocalStage';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment NavigateMeetingMutation_team on NavigateMeetingPayload {
    meeting {
      id
      facilitatorStageId
    }
    oldFacilitatorStage {
      id
      isComplete
    }
  }
`;

const mutation = graphql`
  mutation NavigateMeetingMutation($meetingId: ID!, $completedStageId: ID, $facilitatorStageId: ID) {
    navigateMeeting(meetingId: $meetingId, completedStageId: $completedStageId, facilitatorStageId: $facilitatorStageId) {
      error {
        message
      }
      ...NavigateMeetingMutation_team @relay(mask: false)
    }
  }
`;

export const navigateMeetingTeamOnNext = (payload, context) => {
  const {environment} = context;
  const {meeting: {id: meetingId, facilitatorStageId}, oldFacilitatorStage: {id: oldFacilitatorStageId}} = payload;
  commitLocalUpdate(environment, (store) => {
    const meetingProxy = store.get(meetingId);
    const viewerStageId = getInProxy(meetingProxy, 'localStage', 'id');
    if (viewerStageId === oldFacilitatorStageId) {
      setLocalStageAndPhase(store, meetingId, facilitatorStageId);
    }
  });
};

const NavigateMeetingMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, facilitatorStageId, completedStageId} = variables;
      const meeting = store.get(meetingId);
      meeting.setValue(facilitatorStageId, 'facilitatorStageId');
      const phases = meeting.getLinkedRecords('phases');
      for (let ii = 0; ii < phases.length; ii++) {
        const phase = phases[ii];
        const stages = phase.getLinkedRecords('stages');
        const stage = stages.find((curStage) => curStage.getValue('id') === completedStageId);
        if (stage) {
          stage.setValue(true, 'isComplete');
        }
      }
    },
    onCompleted,
    onError
  });
};

export default NavigateMeetingMutation;
