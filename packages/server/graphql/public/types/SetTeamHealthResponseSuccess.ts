import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {SetTeamHealthResponseSuccessResolvers} from '../resolverTypes'
import type {TeamHealthResponseStageSource} from './TeamHealthResponseStage'

export type SetTeamHealthResponseSuccessSource = {
  meetingId: string
  teamId: string
  stage: TeamHealthResponseStageSource
}

const SetTeamHealthResponseSuccess: SetTeamHealthResponseSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as TeamHealthMeeting
  }
}

export default SetTeamHealthResponseSuccess
