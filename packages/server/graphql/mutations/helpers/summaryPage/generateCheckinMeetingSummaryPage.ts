import type {JSONContent} from '@tiptap/core'
import type {CheckInMeeting} from '../../../../postgres/types/Meeting'
import type {InternalContext} from '../../../graphql'
import {getAgendaItemBlocks} from './getAgendaItemBlocks'
import {getCheckinMetaBlock} from './getCheckinMetaBlock'
import {getParticipantBlocks} from './getParticipantBlocks'
import {getSubtitleBlock} from './getSubtitleBlock'
import {getTaskBlocks} from './getTaskBlocks'
import {getTitleBlock} from './getTitleBlock'

export const generateCheckinMeetingSummaryPage = async function* (
  meetingId: string,
  context: InternalContext
) {
  const {dataLoader} = context
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as CheckInMeeting
  // start the work at the same time, then deliver it in order
  const promises = [
    getTitleBlock(meeting),
    getSubtitleBlock(meeting, dataLoader),
    getCheckinMetaBlock(meeting, dataLoader),
    getTaskBlocks(meetingId, dataLoader),
    getAgendaItemBlocks(meetingId, dataLoader),
    getParticipantBlocks(meetingId, dataLoader)
  ] as Promise<JSONContent[] | null>[]
  for (const promise of promises) {
    const blocks = await promise
    const content = !blocks ? null : Array.isArray(blocks) ? blocks : [blocks]
    yield content
  }
}
