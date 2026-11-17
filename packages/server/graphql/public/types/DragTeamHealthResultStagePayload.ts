import type {TeamHealthResultStage} from '../../../postgres/types/NewMeetingPhase'
import type {DragTeamHealthResultStagePayloadResolvers} from '../resolverTypes'

export type DragTeamHealthResultStagePayloadSource = {
  meetingId: string
  teamId: string
  stage: TeamHealthResultStage & {meetingId: string; teamId: string}
}

const DragTeamHealthResultStagePayload: DragTeamHealthResultStagePayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') throw new Error('Meeting is not a team health')
    return meeting
  }
}

export default DragTeamHealthResultStagePayload
