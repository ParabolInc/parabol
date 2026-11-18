import {GraphQLError} from 'graphql'
import type TimelineEventTeamHealthCompleteModel from '../../../database/types/TimelineEventTeamHealthComplete'
import type {TimelineEventTeamHealthCompleteResolvers} from '../resolverTypes'

export type TimelineEventTeamHealthCompleteSource = Pick<
  TimelineEventTeamHealthCompleteModel,
  keyof TimelineEventTeamHealthCompleteModel
>

const TimelineEventTeamHealthComplete: TimelineEventTeamHealthCompleteResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth')
      throw new GraphQLError('Meeting is not a team health meeting', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  }
}

export default TimelineEventTeamHealthComplete
