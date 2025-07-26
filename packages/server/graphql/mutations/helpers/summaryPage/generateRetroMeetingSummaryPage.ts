import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'
import {makeMeetingInsightInput} from '../../../../utils/makeMeetingInsightInput'
import {getInsightsBlocks} from './getInsightsBlocks'
import {getParticipantBlocks} from './getParticipantBlocks'
import {getRetroMetaBlock} from './getRetroMetaBlock'
import {getSubtitleBlock} from './getSubtitleBlock'
import {getTaskBlocks} from './getTaskBlocks'
import {getTitleBlock} from './getTitleBlock'
import {getTopicBlocks} from './getTopicBlocks'

export const generateRetroMeetingSummaryPage = async function* (
  meetingId: string,
  dataLoader: DataLoaderInstance
) {
  const meeting = (await dataLoader
    .get('newMeetings')
    .loadNonNull(meetingId)) as RetrospectiveMeeting
  const meetingInsightObject = await makeMeetingInsightInput(meeting, dataLoader)
  // start the work at the same time, then deliver it in order
  const promises = [
    getTitleBlock(meeting),
    getSubtitleBlock(meeting, dataLoader),
    getRetroMetaBlock(meeting, dataLoader),
    getInsightsBlocks(meetingId, meetingInsightObject, dataLoader),
    getTaskBlocks(meetingId, dataLoader),
    getTopicBlocks(meetingId, meetingInsightObject),
    getParticipantBlocks(meetingId, dataLoader)
  ]
  for await (const blocks of promises) {
    const content = !blocks ? null : Array.isArray(blocks) ? blocks : [blocks]
    yield content
  }
}
