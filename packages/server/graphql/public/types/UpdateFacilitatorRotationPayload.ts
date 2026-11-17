import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {UpdateFacilitatorRotationPayloadResolvers} from '../resolverTypes'

export type UpdateFacilitatorRotationPayloadSource = {
  teamId: string
  meetingId?: string | null
}

const UpdateFacilitatorRotationPayload: UpdateFacilitatorRotationPayloadResolvers = {
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

export default UpdateFacilitatorRotationPayload
