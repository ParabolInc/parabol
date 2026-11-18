import {TiptapTransformer} from '@hocuspocus/transformer'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import generateUID from '../../../../../../generateUID'
import getKysely from '../../../../../../postgres/getKysely'
import {CipherId} from '../../../../../../utils/CipherId'
import type {ConfluenceServerManager} from '../../../../../../utils/ConfluenceServerManager'
import type {PageExportPageState} from '../../../../../../utils/confluence/types'
import getPubSub from '../../../../../../utils/getPubSub'
import getRedis from '../../../../../../utils/getRedis'
import {createNewPage} from '../../../../../../utils/tiptap/createNewPage'
import {exportPageEntry} from '../exportPageEntry'

const pg = getKysely()
const userId = `entryExport|${generateUID()}`

const toContent = (...content: object[]) =>
  ({type: 'doc', content}) as unknown as TipTapSerializedPageContent
const heading = (text: string) => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

const makeStubConfluence = () => {
  const storageValues: string[] = []
  const confluence = {
    createPageWithUniqueTitle: async (input: {title: string; storageValue: string}) => {
      storageValues.push(input.storageValue)
      return {
        page: {id: 'c1', title: input.title, version: 1, webui: '/spaces/T/pages/c1/x'},
        finalTitle: input.title
      }
    },
    uploadAttachment: async () => undefined
  } as unknown as ConfluenceServerManager
  return {confluence, storageValues}
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Entry Tester'
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

describe('exportPageEntry synced blocks', () => {
  it('flattens the block for a normal export and skips it for a token-scoped one', async () => {
    const host = await createNewPage({userId, content: toContent(heading('Host'))})
    const block = await createNewPage({
      userId,
      parentPageId: host.id,
      isSyncedBlock: true,
      content: toContent(heading('Escalation path'), para('Call on-call first'))
    })
    const withLink = toContent(heading('Host'), {
      type: 'pageLinkBlock',
      attrs: {
        pageCode: CipherId.encrypt(block.id),
        title: 'Escalation path',
        synced: true,
        canonical: true
      }
    })
    const yDoc = Buffer.from(
      encodeStateAsUpdate(TiptapTransformer.toYdoc(withLink, undefined, serverTipTapExtensions))
    )
    await pg.updateTable('Page').set({yDoc}).where('id', '=', host.id).execute()
    const entry: PageExportPageState = {
      pageId: host.id,
      title: 'Host',
      depth: 0,
      parentPageId: null,
      status: 'pending'
    }
    const exportAs = async (isTokenScoped: boolean) => {
      const {confluence, storageValues} = makeStubConfluence()
      const result = await exportPageEntry({
        entry,
        pagesJson: [entry],
        parentConfluenceId: undefined,
        confluence,
        spaceId: 's1',
        siteUrl: undefined,
        userId,
        pageExportId: 'test',
        isTokenScoped
      })
      return {result, storage: storageValues[0]!}
    }

    const normal = await exportAs(false)
    expect(normal.result.status).toBe('success')
    expect(normal.storage).toContain('Call on-call first')
    const tokenScoped = await exportAs(true)
    expect(tokenScoped.storage).not.toContain('Call on-call first')
    expect(tokenScoped.result).toMatchObject({
      status: 'success',
      degraded: expect.arrayContaining([
        expect.objectContaining({blockType: 'syncedBlock', count: 1})
      ])
    })
  }, 30_000)
})
