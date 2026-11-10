import type {RecordProxy, RecordSourceProxy} from 'relay-runtime'
import MeetingMemberId from '../../shared/gqlIds/MeetingMemberId'
import fromTeamMemberId from '../../utils/relay/fromTeamMemberId'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import {setLocalStageAndPhase} from '../../utils/relay/updateLocalStage'

const getTeamMemberId = (record: RecordProxy | null | undefined) =>
  record?.getValue('teamMemberId') ?? record?.getLinkedRecord('teamMember')?.getValue('id')

const isTeamMemberStage = (stage: RecordProxy | null | undefined, teamMemberId: string) =>
  !!stage &&
  (getTeamMemberId(stage) === teamMemberId ||
    getTeamMemberId(stage.getLinkedRecord('agendaItem')) === teamMemberId)

const handleRemoveUserFromMeeting = (
  meetingId: string,
  teamMemberId: string,
  store: RecordSourceProxy
) => {
  const meeting = store.get(meetingId)
  if (!meeting) return
  const {userId} = fromTeamMemberId(teamMemberId)
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
    const remainingStages = stages.filter((stage) => !isTeamMemberStage(stage, teamMemberId))
    if (remainingStages.length === stages.length) return
    phase.setLinkedRecords(remainingStages, 'stages')
  })
  const facilitatorStageId = meeting.getValue('facilitatorStageId')
  const localStage = meeting.getLinkedRecord('localStage')
  if (typeof facilitatorStageId === 'string' && isTeamMemberStage(localStage, teamMemberId)) {
    setLocalStageAndPhase(store, meetingId, facilitatorStageId)
  }
}

export default handleRemoveUserFromMeeting
