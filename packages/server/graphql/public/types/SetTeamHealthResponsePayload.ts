import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {SetTeamHealthResponsePayloadResolvers} from '../resolverTypes'
import type {TeamHealthResponseStageSource} from './TeamHealthResponseStage'

export type SetTeamHealthResponsePayloadSource = {
  meetingId: string
  teamId: string
  stage: TeamHealthResponseStageSource
}

const SetTeamHealthResponsePayload: SetTeamHealthResponsePayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as TeamHealthMeeting
  }
}

export default SetTeamHealthResponsePayload
