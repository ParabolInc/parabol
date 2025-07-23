import {createTopLevelPage} from '../../../../utils/tiptap/createTopLevelPage'
import type {DataLoaderWorker} from '../../../graphql'
import {generateRetroMeetingSummaryPage} from './generateRetroMeetingSummaryPage'

export const publishSummaryPage = async (
  userId: string,
  meetingId: string,
  dataLoader: DataLoaderWorker,
  mutatorId: string | null | undefined
) => {
  const content = await generateRetroMeetingSummaryPage(meetingId, dataLoader)
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting
  const page = await createTopLevelPage(userId, dataLoader, {content, teamId, mutatorId})
  return page
}
