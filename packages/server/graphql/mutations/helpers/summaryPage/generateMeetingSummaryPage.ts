import type {GraphQLResolveInfo} from 'graphql'
import type {InternalContext} from '../../../graphql'
import {generatePokerMeetingSummaryPage} from './generatePokerMeetingSummaryPage'
import {generateRetroMeetingSummaryPage} from './generateRetroMeetingSummaryPage'

export const generateMeetingSummaryPage = async (
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {meetingType} = meeting
  switch (meetingType) {
    case 'retrospective':
      return generateRetroMeetingSummaryPage(meetingId, dataLoader)
    case 'poker':
      return generatePokerMeetingSummaryPage(meetingId, context, info)
    default:
      throw new Error(`${meetingType}: generator not implemented`)
  }
}
