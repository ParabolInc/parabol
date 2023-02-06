import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'react-relay'
import {readInlineData, RecordSourceProxy} from 'relay-runtime'
import {updateLocalStage_meeting$key} from '~/__generated__/updateLocalStage_meeting.graphql'
import Atmosphere from '../../Atmosphere'
import findBestNavigableStage from '../meetings/findBestNavigableStage'
import findStageById from '../meetings/findStageById'

export const setLocalStageAndPhase = (
  store: RecordSourceProxy,
  meetingId: string,
  stageId: string
) => {
  const meetingProxy = store.get(meetingId)
  const stage = store.get(stageId)
  if (!meetingProxy || !stage) return
  const facilitatorPhaseProxy = meetingProxy
    .getLinkedRecords('phases')!
    .find(
      (phase) =>
        !!phase!.getLinkedRecords('stages')!.find((stage) => stage!.getValue('id') === stageId)
    )

  if (!facilitatorPhaseProxy) return
  meetingProxy
    .setLinkedRecord(stage, 'localStage')
    .setLinkedRecord(facilitatorPhaseProxy, 'localPhase')
}

const updateLocalStage = (
  atmosphere: Atmosphere,
  meetingRef: updateLocalStage_meeting$key,
  stageId: string
) => {
  const meeting = readInlineData(
    graphql`
      fragment updateLocalStage_meeting on NewMeeting @inline {
        id
        facilitatorStageId
        phases {
          phaseType
          stages {
            id
            isComplete
            isNavigable
          }
        }
      }
    `,
    meetingRef
  )

  const {phases, id: meetingId} = meeting
  const safeStage = findStageById(phases, stageId) ?? findBestNavigableStage(phases)
  if (!safeStage) return

  commitLocalUpdate(atmosphere, (store) => {
    setLocalStageAndPhase(store, meetingId, safeStage.stage.id)
  })
}

export default updateLocalStage
