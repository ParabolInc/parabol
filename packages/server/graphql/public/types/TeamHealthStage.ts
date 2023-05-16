import {TeamHealthStageResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import TeamHealthStageDB from '../../../database/types/TeamHealthStage'

export type TeamHealthStageSource = TeamHealthStageDB & {
  meetingId: string
}

const TeamHealthStage: TeamHealthStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH',
  meeting: ({meetingId}, _args: any, {dataLoader}) => dataLoader.get('newMeetings').load(meetingId),
  phase: async ({meetingId, phaseType}, _args: any, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {phases} = meeting
    return phases.find((phase) => phase.phaseType === phaseType)
  },
  isViewerReady: ({readyToAdvance}: {readyToAdvance?: string[]}, _args: any, {authToken}) => {
    const viewerId = getUserId(authToken)
    return readyToAdvance?.includes(viewerId) ?? false
  },
  readyCount: async ({meetingId, readyToAdvance}, _args: any, {dataLoader}, ref: any) => {
    if (!readyToAdvance) return 0
    if (!meetingId) console.log('no meetingid', ref)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {facilitatorUserId} = meeting
    return readyToAdvance.filter((userId: string) => userId !== facilitatorUserId).length
  },
  timeRemaining: ({scheduledEndTime}: {scheduledEndTime?: Date | null}) => {
    return scheduledEndTime ? (scheduledEndTime as any) - Date.now() : null
  },
  scores: ({id: stageId, scores}) => {
    return (
      scores?.map((score) => ({
        ...score,
        stageId
      })) ?? []
    )
  }
}

export default TeamHealthStage
