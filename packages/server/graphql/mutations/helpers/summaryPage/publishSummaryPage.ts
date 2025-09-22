import type {GraphQLResolveInfo} from 'graphql'
import getKysely from '../../../../postgres/getKysely'
import {getUserId} from '../../../../utils/authorization'
import {createTopLevelPage} from '../../../../utils/tiptap/createTopLevelPage'
import type {InternalContext} from '../../../graphql'
import {streamSummaryBlocksToPage} from './streamSummaryBlocksToPage'

export const publishSummaryPage = async (
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const userId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting
  // start creating meeting summaries for everyone, feature flag or not
  const page = await createTopLevelPage(userId, dataLoader, {
    teamId,
    mutatorId,
    summaryMeetingId: meetingId
  })
  const {id: pageId} = page
  await getKysely()
    .updateTable('NewMeeting')
    .set({summaryPageId: pageId})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.get('newMeetings').clear(meetingId)
  // don't wait for the stream to finish
  streamSummaryBlocksToPage(pageId, meetingId, context, info)
  return page
}
