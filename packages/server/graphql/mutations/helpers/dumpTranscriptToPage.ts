import {generateText, type JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import {__START__} from 'parabol-client/shared/sortOrder'
import {getTitleFromPageText} from 'parabol-client/shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {DataLoaderWorker} from '../../../graphql/graphql'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {analytics} from '../../../utils/analytics/analytics'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {generateJSON} from '../../../utils/tiptap/generateJSON'
import {getPageNextSortOrder} from '../../public/mutations/helpers/getPageNextSortOrder'

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
    .map((block) => `<p>${escapeHtml(block.speaker)}: ${escapeHtml(block.words)}</p>`)
    .join('')
  const fullHtml = meetingTitleHtml + transcriptHtml

  const jsonContent = generateJSON(fullHtml, serverTipTapExtensions) as JSONContent
  const yDocState = Buffer.alloc(0)

  const pg = getKysely()

  const isPrivate = false
  const sortOrder = await getPageNextSortOrder(__START__, false, viewerId, isPrivate, teamId)

  const docText = generateText(jsonContent, serverTipTapExtensions)
  const {title, contentStartsAt} = getTitleFromPageText(docText)
  const plaintextContent = docText.slice(contentStartsAt)

  const page = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      parentPageId: null,
      isPrivate,
      ancestorIds: [],
      teamId,
      sortOrder,
      yDoc: Buffer.from(yDocState),
      title,
      plaintextContent
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const {id: pageId} = page

  await Promise.all([
    pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute(),
    pg.insertInto('PageUserAccess').values({userId: viewerId, pageId, role: 'owner'}).execute()
  ])

  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  analytics.pageCreated(viewer, pageId)

  return {transcription, pageId}
}
