import {GraphQLError} from 'graphql'
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
    if (meeting.meetingType !== 'teamHealth')
      throw new GraphQLError('Meeting is not a team health', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  }
}

export default DragTeamHealthResultStagePayload
