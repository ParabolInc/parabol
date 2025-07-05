import {type JSONContent} from '@tiptap/core'
import {generateJSON} from '@tiptap/html'
import {sql} from 'kysely'
import {__START__} from 'parabol-client/shared/sortOrder'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {DataLoaderWorker} from '../../../graphql/graphql'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {analytics} from '../../../utils/analytics/analytics'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {updatePageContent} from '../../../utils/tiptap/updatePageContent'
import {getPageNextSortOrder} from '../../public/mutations/helpers/getPageNextSortOrder'

export const dumpTranscriptToPage = async (
  recallBotId: string | null,
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  if (!recallBotId) return null

  const [meeting, manager] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    new RecallAIServerManager()
  ])

  if (!meeting || meeting.meetingType !== 'retrospective' || !meeting.facilitatorUserId) return null

  const transcription = await manager.getBotTranscript(recallBotId)

  if (!transcription || transcription.length === 0) return null

  const viewerId = meeting.facilitatorUserId
  const {teamId, name: meetingName} = meeting

  const meetingTitleHtml = `<h1>Meeting Transcript: ${meetingName}</h1>`
  const transcriptHtml = transcription
    .map((block) => `<p>${block.speaker}: ${block.words}</p>`)
    .join('')
  const fullHtml = meetingTitleHtml + transcriptHtml

  const jsonContent = generateJSON(fullHtml, serverTipTapExtensions) as JSONContent
  const yDocState = Buffer.alloc(0)

  const pg = getKysely()

  const isPrivate = false
  const sortOrder = await getPageNextSortOrder(__START__, viewerId, isPrivate, teamId, null)

  const page = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      parentPageId: null,
      isPrivate,
      ancestorIds: [],
      teamId,
      sortOrder
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const {id: pageId} = page

  await Promise.all([
    pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute(),
    pg.insertInto('PageUserAccess').values({userId: viewerId, pageId, role: 'owner'}).execute()
  ])

  await updatePageContent(pageId, jsonContent, Buffer.from(yDocState))

  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  analytics.pageCreated(viewer, pageId)

  return {transcription, pageId}
}
