import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {UpdateFacilitatorRotationSuccessResolvers} from '../resolverTypes'

export type UpdateFacilitatorRotationSuccessSource = {
  teamId: string
  meetingId?: string | null
}

const UpdateFacilitatorRotationSuccess: UpdateFacilitatorRotationSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId),
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    if (!meetingId) return null
    return (await dataLoader.get('newMeetings').load(meetingId)) ?? null
  },
  facilitatorStage: async ({meetingId}, _args, {dataLoader}) => {
    if (!meetingId) return null
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return null
    const {facilitatorStageId, phases, teamId} = meeting
    if (!facilitatorStageId) return null
    const stageRes = findStageById(phases, facilitatorStageId)
    if (!stageRes) return null
    return {...stageRes.stage, meetingId, teamId}
  }
}

export default UpdateFacilitatorRotationSuccess
