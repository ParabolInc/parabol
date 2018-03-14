import {commitMutation} from 'react-relay';

graphql`
  fragment NavigateMeetingMutation_team on NavigateMeetingPayload {
    meeting {
      facilitatorStageId
      phases {
        stages {
          isComplete
        }
      }
    }
  }
`;

const mutation = graphql`
  mutation NavigateMeetingMutation($meetingId: ID!, completedStageId: ID, facilitatorStageId: ID) {
    moveMeeting(meetingId: $meetingId, completedStageId: $completedStageId, facilitatorStageId: $facilitatorStageId) {
      error {
        message
      }
      ...NavigateMeetingMutation_team @relay(mask: false)
    }
  }
`;

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
