import type {GraphQLResolveInfo} from 'graphql'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import {redisHocusPocus} from '../../../../hocusPocus'
import getKysely from '../../../../postgres/getKysely'
import {getUserId} from '../../../../utils/authorization'
import {Logger} from '../../../../utils/Logger'
import {PageId} from '../../../../utils/PageId'
import {createNewPage} from '../../../../utils/tiptap/createNewPage'
import type {InternalContext} from '../../../graphql'
import {ensureMeetingTOCPage} from './ensureMeetingTOCPage'
import {getTitleBlock} from './getTitleBlock'
import {streamSummaryBlocksToPage} from './streamSummaryBlocksToPage'

export const publishSummaryPage = async (
  meetingId: string,
  contextWithoutDataLoader: Omit<InternalContext, 'dataLoader'>,
  info: GraphQLResolveInfo
) => {
  const {authToken, socketId: mutatorId} = contextWithoutDataLoader
  const dataLoader = getNewDataLoader('publishSummaryPage')
  const context = {...contextWithoutDataLoader, dataLoader}
  dataLoader.share()
  const userId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting
  const pg = getKysely()
  // Get or create the meeting TOC page for this team
  const meetingTOCpageId = await ensureMeetingTOCPage(userId, teamId, dataLoader, mutatorId)
  const titleBlock = getTitleBlock(meeting)
  const title = titleBlock.content[0]?.text ?? '<Untitled>'
  const meetingSummaryPage = await createNewPage({
    parentPageId: meetingTOCpageId,
    userId,
    content: {
      type: 'doc',
      content: [
        // we do this here instead of in the stream
        // because the schema enforces a title
        // so we need a title before we can insert a thinking block
        titleBlock,
        {
          type: 'thinkingBlock'
        }
      ]
    }
  })
  const documentName = PageId.join(meetingTOCpageId)
  await redisHocusPocus.handleEvent('addCanonicalPageLink', documentName, {
    title,
    pageCode: PageId.code(meetingSummaryPage.id),
    isDatabase: false
  })
  const {id: pageId} = meetingSummaryPage
  await pg
    .updateTable('NewMeeting')
    .set({summaryPageId: pageId})
    .where('id', '=', meetingId)
    .execute()
  meeting.summaryPageId = pageId
  // don't wait for the stream to finish
  streamSummaryBlocksToPage(pageId, meetingId, context, info).catch(Logger.log)
  dataLoader.dispose()
  return meetingSummaryPage
}
