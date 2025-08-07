import type {JSONContent} from '@tiptap/core'
import type {PokerMeeting} from '../../../../postgres/types/Meeting'
import type {InternalContext} from '../../../graphql'
import {getInsightsBlocks} from './getInsightsBlocks'
import {getSubtitleBlock} from './getSubtitleBlock'
import {getTeamPromptBlocks} from './getTeamPromptBlocks'
import {getTeamPromptMetaBlock} from './getTeamPromptMetaBlock'
import {getTitleBlock} from './getTitleBlock'

export const generateTeamPromptMeetingSummaryPage = async function* (
  meetingId: string,
  context: InternalContext
) {
  const {dataLoader} = context
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
  // start the work at the same time, then deliver it in order
  const promises = [
    getTitleBlock(meeting),
    getSubtitleBlock(meeting, dataLoader),
    getTeamPromptMetaBlock(meeting, dataLoader),
    getInsightsBlocks(meetingId, dataLoader),
    getTeamPromptBlocks(meetingId, dataLoader)
  ] as Promise<JSONContent[] | null>[]
  for (const promise of promises) {
    const blocks = await promise
    const content = !blocks ? null : Array.isArray(blocks) ? blocks : [blocks]
    yield content
  }
}
