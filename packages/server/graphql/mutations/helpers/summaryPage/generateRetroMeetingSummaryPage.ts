import type {JSONContent} from '@tiptap/core'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../../graphql/isValid'
import type {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'
import {makeMeetingInsightInput} from '../../../../utils/makeMeetingInsightInput'
import {getInsightsBlocks} from './getInsightsBlocks'
import {getParticipantBlocks} from './getParticipantBlocks'
import {getRetroMetaBlock} from './getRetroMetaBlock'
import {getSubtitleBlock} from './getSubtitleBlock'
import {getTaskBlocks} from './getTaskBlocks'
import {getTitleBlock} from './getTitleBlock'
import {getTopicBlocks} from './getTopicBlocks'

export const generateRetroMeetingSummaryPage = async (
  meetingId: string,
  dataLoader: DataLoaderInstance
) => {
  const meeting = (await dataLoader
    .get('newMeetings')
    .loadNonNull(meetingId)) as RetrospectiveMeeting
  const meetingInsightObject = await makeMeetingInsightInput(meeting, dataLoader)
  const content = [
    getTitleBlock(meeting),
    await getSubtitleBlock(meeting, dataLoader),
    await getRetroMetaBlock(meeting, dataLoader),
    ...(await getInsightsBlocks(meetingId, meetingInsightObject, dataLoader)),
    ...(await getTaskBlocks(meetingId, dataLoader)),
    ...getTopicBlocks(meetingId, meetingInsightObject),
    ...(await getParticipantBlocks(meetingId, dataLoader))
  ]

  return {
    type: 'doc',
    content: content.filter(isValid)
  } as JSONContent
}
