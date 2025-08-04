import type {JSONContent} from '@tiptap/core'
import type {GraphQLResolveInfo} from 'graphql'
import type {PokerMeeting} from '../../../../postgres/types/Meeting'
import type {InternalContext} from '../../../graphql'
import {getParticipantBlocks} from './getParticipantBlocks'
import {getPokerMetaBlock} from './getPokerMetaBlock'
import {getPokerTable} from './getPokerTable'
import {getSubtitleBlock} from './getSubtitleBlock'
import {getTitleBlock} from './getTitleBlock'

export const generatePokerMeetingSummaryPage = async function* (
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) {
  const {dataLoader} = context
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
  // start the work at the same time, then deliver it in order
  const promises = [
    getTitleBlock(meeting),
    getSubtitleBlock(meeting, dataLoader),
    getPokerMetaBlock(meeting, dataLoader),
    // getInsightsBlocks(meetingId, dataLoader),
    getPokerTable(meetingId, context, info),
    getParticipantBlocks(meetingId, dataLoader)
  ] as Promise<JSONContent[] | null>[]
  for (const promise of promises) {
    const blocks = await promise
    const content = !blocks ? null : Array.isArray(blocks) ? blocks : [blocks]
    yield content
  }
}
