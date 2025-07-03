import {type JSONContent} from '@tiptap/core'
import {generateJSON} from '@tiptap/html'
import {sql} from 'kysely'
import {__START__} from 'parabol-client/shared/sortOrder'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import * as Y from 'yjs'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {analytics} from '../../../utils/analytics/analytics'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {updatePageContent} from '../../../utils/tiptap/updatePageContent'
import {getPageNextSortOrder} from '../../public/mutations/helpers/getPageNextSortOrder'

export const dumpTranscriptToPage = async (
  recallBotId: string | null,
  meetingId: string,
  dataLoader: any
) => {
  if (!recallBotId) return null

  const [meeting, manager] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    new RecallAIServerManager()
  ])

  if (!meeting || meeting.meetingType !== 'retrospective') return null

  // const transcription = await manager.getBotTranscript(recallBotId)
  const transcription = [
    {
      speaker: "Nick O'Ferrall",
      words:
        'Test up, transcription, test, test, test. And see if these words show up at the end of the meeting.'
    }
  ]
  console.log('🚀 ~ transcription:', transcription)

  if (!transcription || transcription.length === 0) return null

  const viewerId = meeting.facilitatorUserId
  const {teamId, name: meetingName} = meeting

  const transcriptionText = transcription
    .map((block) => `${block.speaker}: ${block.words}`)
    .join('\n\n')

  const meetingTitle = `Meeting Transcript: ${meetingName}`
  const contentHtml = `<h1>${meetingTitle}</h1><p>${transcriptionText.replace(/\n\n/g, '</p><p>')}</p>`

  console.log('🚀 ~ contentHtml:', contentHtml)

  const jsonContent = generateJSON(contentHtml, serverTipTapExtensions) as JSONContent

  console.log('🚀 ~ jsonContent:', JSON.stringify(jsonContent, null, 2))

  // Create Y.js document from TipTap content
  const yDoc = new Y.Doc()
  const xmlFragment = yDoc.getXmlFragment('default')

  // Create a simple document structure
  const docElement = new Y.XmlElement()
  docElement.nodeName = 'doc'

  // Add heading
  const headingElement = new Y.XmlElement()
  headingElement.nodeName = 'heading'
  headingElement.setAttribute('level', '1')
  const headingText = new Y.XmlText()
  headingText.insert(0, meetingTitle)
  headingElement.insert(0, [headingText])
  docElement.insert(0, [headingElement])

  // Add paragraph with transcript
  const paragraphElement = new Y.XmlElement()
  paragraphElement.nodeName = 'paragraph'
  const paragraphText = new Y.XmlText()
  paragraphText.insert(0, transcriptionText)
  paragraphElement.insert(0, [paragraphText])
  docElement.insert(1, [paragraphElement])

  xmlFragment.insert(0, [docElement])

  const yDocState = Y.encodeStateAsUpdate(yDoc)

  console.log('🚀 ~ yDocState length:', yDocState.length)

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

  const viewerAccessPromise = pg
    .insertInto('PageUserAccess')
    .values({userId: viewerId, pageId, role: 'owner'})
    .execute()

  await pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute()
  await viewerAccessPromise

  try {
    const updateResult = await updatePageContent(pageId, jsonContent, Buffer.from(yDocState))
    console.log(`📄 updatePageContent result:`, updateResult)
  } catch (error) {
    console.error(`❌ Error updating page content:`, error)
  }

  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()

  console.log(`📄 Page content saved for page ID: ${pageId}`)

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  analytics.pageCreated(viewer, pageId)

  console.log(`📄 Transcript page created with ID: ${pageId}`)

  return {transcription, pageId}
}
