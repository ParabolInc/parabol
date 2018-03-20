import {commitLocalUpdate} from 'react-relay';

export const setLocalStageAndPhase = (store, meetingId, stageId) => {
  const meetingProxy = store.get(meetingId);
  if (!meetingProxy) return;
  const facilitatorPhaseProxy = meetingProxy
    .getLinkedRecords('phases')
    .find((phase) => phase.getLinkedRecords('stages').find((stage) => stage.getValue('id') === stageId));
  meetingProxy
    .setLinkedRecord(store.get(stageId), 'localStage')
    .setLinkedRecord(facilitatorPhaseProxy, 'localPhase');
};

const updateLocalStage = (atmosphere, meetingId, stageId) => {
  commitLocalUpdate(atmosphere, (store) => {
    setLocalStageAndPhase(store, meetingId, stageId);
  });
};

export default updateLocalStage;
