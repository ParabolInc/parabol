import {commitMutation} from 'react-relay';
import fromStageIdToUrl from 'universal/utils/meetings/fromStageIdToUrl';
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams';
import fromUrlToStage from 'universal/utils/meetings/fromUrlToStage';
import findStageById from 'universal/utils/meetings/findStageById';

graphql`
  fragment NavigateMeetingMutation_team on NavigateMeetingPayload {
    stageCompleted {
      id
    }
    meeting {
      facilitatorStageId
      phases {
        phaseType
        stages {
          isComplete
        }
      }
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
  const {history} = context;
  const {meeting: {facilitatorStageId, phases}, stageCompleted: {id: stageCompletedId}} = payload;
  const {meetingType, teamId} = getMeetingPathParams();
  if (!meetingType || !teamId) return;
  const oldFacilitatorPhaseStageRes = findStageById(phases, stageCompletedId);
  const viewerStage = fromUrlToStage(phases);
  if (!oldFacilitatorPhaseStageRes || !viewerStage) return;
  const {stage: {id: oldFacilitatorStageId}} = oldFacilitatorPhaseStageRes;
  const {id: viewerStageId} = viewerStage;
  const inSync = viewerStageId === oldFacilitatorStageId;
  if (inSync) {
    const facilitatorStageUrl = fromStageIdToUrl(facilitatorStageId, phases);
    history.push(facilitatorStageUrl);
  }
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
