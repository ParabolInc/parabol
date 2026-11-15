import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../CipherId'
import getPubSub from '../../getPubSub'
import getRedis from '../../getRedis'
import {createNewPage} from '../../tiptap/createNewPage'
import {loadSyncedBlockBodies} from '../loadSyncedBlockBodies'

const pg = getKysely()
const userId = `syncedBodies|${generateUID()}`
const strangerId = `syncedBodiesStranger|${generateUID()}`

const heading = (text: string) => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const syncedLink = (pageId: number) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode: CipherId.encrypt(pageId), title: 'Block', canonical: true, synced: true}
})
const toContent = (...content: object[]) =>
  ({type: 'doc', content}) as unknown as TipTapSerializedPageContent
const hostDoc = (...blocks: number[]) => ({
  type: 'doc',
  content: [heading('Host'), ...blocks.map(syncedLink)]
})

const makeBlock = async (hostId: number, ...content: object[]) =>
  createNewPage({
    userId,
    parentPageId: hostId,
    isSyncedBlock: true,
    content: toContent(...content)
  })

const setContent = async (pageId: number, content: TipTapSerializedPageContent) => {
  const yDoc = Buffer.from(
    encodeStateAsUpdate(TiptapTransformer.toYdoc(content, undefined, serverTipTapExtensions))
  )
  await pg.updateTable('Page').set({yDoc}).where('id', '=', pageId).execute()
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [userId, strangerId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: 'Synced Bodies Tester'
      }))
    )
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', 'in', [userId, strangerId]).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

describe('loadSyncedBlockBodies', () => {
  it("loads a readable block's body without its name", async () => {
    const host = await createNewPage({userId, content: toContent(heading('Host'))})
    const block = await makeBlock(host.id, heading('Escalation path'), para('Call on-call first'))
    const bodies = await loadSyncedBlockBodies(hostDoc(block.id) as JSONContent, userId)
    expect(bodies.get(CipherId.encrypt(block.id))).toEqual([
      expect.objectContaining({
        type: 'paragraph',
        content: [expect.objectContaining({text: 'Call on-call first'})]
      })
    ])
  }, 30_000)

  it("leaves out a block the viewer can't open", async () => {
    const host = await createNewPage({userId, content: toContent(heading('Host'))})
    const block = await makeBlock(host.id, heading('Secret'), para('Hidden'))
    const bodies = await loadSyncedBlockBodies(hostDoc(block.id) as JSONContent, strangerId)
    expect(bodies.has(CipherId.encrypt(block.id))).toBe(false)
  }, 30_000)

  it('leaves out a block in Trash', async () => {
    const host = await createNewPage({userId, content: toContent(heading('Host'))})
    const block = await makeBlock(host.id, heading('Gone'), para('Deleted'))
    await pg
      .updateTable('Page')
      .set({deletedAt: new Date(), deletedBy: userId})
      .where('id', '=', block.id)
      .execute()
    const bodies = await loadSyncedBlockBodies(hostDoc(block.id) as JSONContent, userId)
    expect(bodies.has(CipherId.encrypt(block.id))).toBe(false)
  }, 30_000)

  it('leaves out a page that is not a synced block', async () => {
    const host = await createNewPage({userId, content: toContent(heading('Host'))})
    const ordinary = await createNewPage({
      userId,
      parentPageId: host.id,
      content: toContent(heading('Ordinary'), para('Plain'))
    })
    const bodies = await loadSyncedBlockBodies(hostDoc(ordinary.id) as JSONContent, userId)
    expect(bodies.size).toBe(0)
  }, 30_000)

  it('follows a block nested inside a block and stops at a cycle', async () => {
    const host = await createNewPage({userId, content: toContent(heading('Host'))})
    const blockA = await makeBlock(host.id, heading('A'), para('A body'))
    const blockB = await makeBlock(host.id, heading('B'), para('B body'))
    await setContent(blockA.id, toContent(heading('A'), para('A body'), syncedLink(blockB.id)))
    await setContent(blockB.id, toContent(heading('B'), para('B body'), syncedLink(blockA.id)))
    const bodies = await loadSyncedBlockBodies(hostDoc(blockA.id) as JSONContent, userId)
    expect([...bodies.keys()].sort()).toEqual(
      [CipherId.encrypt(blockA.id), CipherId.encrypt(blockB.id)].sort()
    )
  }, 30_000)
})
