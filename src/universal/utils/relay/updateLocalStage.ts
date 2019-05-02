import {commitLocalUpdate} from 'react-relay'
import {RecordSourceProxy} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'

export const setLocalStageAndPhase = (
  store: RecordSourceProxy,
  meetingId: string,
  stageId: string
) => {
  const meetingProxy = store.get(meetingId)
  if (!meetingProxy) return
  const facilitatorPhaseProxy = meetingProxy
    .getLinkedRecords('phases')!
    .find(
      (phase) =>
        !!phase!.getLinkedRecords('stages')!.find((stage) => stage!.getValue('id') === stageId)
    )!
  meetingProxy
    .setLinkedRecord(store.get(stageId), 'localStage')
    .setLinkedRecord(facilitatorPhaseProxy, 'localPhase')
}

const updateLocalStage = (atmosphere: Atmosphere, meetingId: string, stageId: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    setLocalStageAndPhase(store, meetingId, stageId)
  })
}

export default updateLocalStage
