import type {TeamHealthResultStage} from '../../../postgres/types/NewMeetingPhase'
import type {DragTeamHealthResultStageSuccessResolvers} from '../resolverTypes'

export type DragTeamHealthResultStageSuccessSource = {
  meetingId: string
  teamId: string
  stage: TeamHealthResultStage & {meetingId: string; teamId: string}
}

const DragTeamHealthResultStageSuccess: DragTeamHealthResultStageSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') throw new Error('Meeting is not a team health')
    return meeting
  }
}

export default DragTeamHealthResultStageSuccess
