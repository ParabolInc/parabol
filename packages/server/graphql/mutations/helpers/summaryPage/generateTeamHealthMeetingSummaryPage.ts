import type {JSONContent} from '@tiptap/core'
import type {TeamHealthMeeting} from '../../../../postgres/types/Meeting'
import type {InternalContext} from '../../../graphql'
import {getInsightsBlocks} from './getInsightsBlocks'
import {getSubtitleBlock} from './getSubtitleBlock'
import {getTeamHealthMetaBlock} from './getTeamHealthMetaBlock'
import {getTeamHealthSummaryTable} from './getTeamHealthSummaryTable'

export const generateTeamHealthMeetingSummaryPage = async function* (
  meetingId: string,
  context: InternalContext
) {
  const {dataLoader} = context
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as TeamHealthMeeting
  // start the work at the same time, then deliver it in order
  const promises = [
    getSubtitleBlock(meeting, dataLoader),
    getTeamHealthMetaBlock(meeting, dataLoader),
    getInsightsBlocks(meetingId, dataLoader),
    getTeamHealthSummaryTable(meetingId, dataLoader)
  ] as Promise<JSONContent[] | null>[]
  for (const promise of promises) {
    const blocks = await promise
    const content = !blocks ? null : Array.isArray(blocks) ? blocks : [blocks]
    yield content
  }
}
