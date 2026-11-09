import type {RecordSourceProxy} from 'relay-runtime'
import MeetingMemberId from '../../shared/gqlIds/MeetingMemberId'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import {setLocalStageAndPhase} from '../../utils/relay/updateLocalStage'

const handleRemoveUserFromMeeting = (
  meetingId: string,
  userId: string,
  removedStageIds: readonly string[],
  store: RecordSourceProxy
) => {
  const meeting = store.get(meetingId)
  if (!meeting) return
  safeRemoveNodeFromArray(MeetingMemberId.join(meetingId, userId), meeting, 'meetingMembers')
  meeting.getLinkedRecords('phases')?.forEach((phase) => {
    const stages = phase?.getLinkedRecords('stages')
    if (!phase || !stages) return
    stages.forEach((stage) => {
      const readyUserIds = stage?.getValue('readyUserIds')
      if (!stage || !Array.isArray(readyUserIds) || !readyUserIds.includes(userId)) return
      const nextReadyUserIds = readyUserIds.filter((readyUserId) => readyUserId !== userId)
      stage.setValue(nextReadyUserIds, 'readyUserIds')
    })
    const remainingStages = stages.filter((stage) => {
      const stageId = stage?.getValue('id')
      return typeof stageId !== 'string' || !removedStageIds.includes(stageId)
    })
    if (remainingStages.length === stages.length) return
    phase.setLinkedRecords(remainingStages, 'stages')
  })
  const localStageId = meeting.getLinkedRecord('localStage')?.getValue('id')
  const facilitatorStageId = meeting.getValue('facilitatorStageId')
  if (
    typeof localStageId === 'string' &&
    typeof facilitatorStageId === 'string' &&
    removedStageIds.includes(localStageId)
  ) {
    setLocalStageAndPhase(store, meetingId, facilitatorStageId)
  }
}

export default handleRemoveUserFromMeeting
