import type {JSONContent} from '@tiptap/core'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'
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
  // start the work at the same time, then deliver it in order
  const promises = [
    getTitleBlock(meeting),
    getSubtitleBlock(meeting, dataLoader),
    getRetroMetaBlock(meeting, dataLoader),
    getInsightsBlocks(meetingId, dataLoader),
    getTaskBlocks(meetingId, dataLoader),
    getTopicBlocks(meetingId, dataLoader),
    getParticipantBlocks(meetingId, dataLoader)
  ] as Promise<JSONContent[] | null>[]
  for (const promise of promises) {
    const blocks = await promise
    const content = !blocks ? null : Array.isArray(blocks) ? blocks : [blocks]
    yield content
  }
}
