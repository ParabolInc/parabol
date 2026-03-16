import Redis from 'ioredis'
import {type Kysely} from 'kysely'
import {pack} from 'msgpackr'
import * as Y from 'yjs'
import {encodeStateAsUpdate, XmlElement} from 'yjs'
import {getRedisOptions} from '../../utils/getRedisOptions'

// Inlined to support two simultaneous cipher instances with different keys
function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
  }
  return hash
}

class FeistelCipher {
  private readonly key: number
  private readonly rounds: number

  constructor(key: number, rounds = 4) {
    this.key = key >>> 0
    this.rounds = rounds
  }

  private feistelFunction(value: number): number {
    return ((value * this.key) ^ (value >>> 3)) >>> 0
  }

  encrypt(input: number): number {
    let l = input & 0xffff
    let r = (input >>> 16) & 0xffff
    for (let i = 0; i < this.rounds; i++) {
      const temp = r
      r = (l ^ this.feistelFunction(r)) & 0xffff
      l = temp
    }
    return ((r << 16) | l) >>> 0
  }

  decrypt(input: number): number {
    let l = input & 0xffff
    let r = (input >>> 16) & 0xffff
    for (let i = 0; i < this.rounds; i++) {
      const temp = l
      l = (r ^ this.feistelFunction(l)) & 0xffff
      r = temp
    }
    return ((r << 16) | l) >>> 0
  }
}

const BATCH_SIZE = 1000

export async function up(db: Kysely<any>): Promise<void> {
  const oldSecret = process.env.SERVER_SECRET!
  const newSecret = process.env.PAGE_CIPHER_KEY || process.env.SERVER_SECRET!

  // PAGE_CIPHER_KEY not set or identical to SERVER_SECRET — nothing to re-encrypt
  if (oldSecret === newSecret) return

  const oldCipher = new FeistelCipher(fnv1aHash(oldSecret.slice(0, 10)))
  const newCipher = new FeistelCipher(fnv1aHash(newSecret.slice(0, 10)))

  // Precompute cipher mappings for all pages so we can handle three cases:
  // 1. pageCode encrypted with oldCipher → re-encrypt with newCipher
  // 2. pageCode already encrypted with newCipher → skip (idempotent)
  // 3. pageCode is an orphan (linked page deleted) → skip
  const allPageIds = await db
    .selectFrom('Page')
    .select('id')
    .where('deletedAt', 'is', null)
    .execute()
  const oldToNew = new Map<number, number>()
  for (const {id} of allPageIds) {
    oldToNew.set(oldCipher.encrypt(id), newCipher.encrypt(id))
  }

  const redis = new Redis(process.env.REDIS_URL!, {
    ...getRedisOptions(),
    connectionName: '2026-03-09T00:00:00.000Z_rekeyPageLinks'
  })
  const SERVER_ID = process.env.SERVER_ID!

  let lastSeenId = 0
  let totalPages = 0
  let totalUpdated = 0

  for (let i = 0; i < 1e6; i++) {
    const pages = await db
      .selectFrom('Page')
      .select(['id', 'yDoc'])
      .where('yDoc', 'is not', null)
      .where('id', '>', lastSeenId)
      .where('deletedAt', 'is', null)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()

    if (pages.length === 0) break
    lastSeenId = pages.at(-1)!.id
    totalPages += pages.length

    await Promise.all(
      pages.map(async ({id: pageId, yDoc}) => {
        if (!yDoc) return
        const doc = new Y.Doc()
        Y.applyUpdate(doc, yDoc)

        const frag = doc.getXmlFragment('default')
        const walker = frag.createTreeWalker(
          (node) => node instanceof XmlElement && node.nodeName === 'pageLinkBlock'
        )
        const pageLinks = Array.from(walker) as XmlElement<any>[]
        if (pageLinks.length === 0) return

        let changed = false
        doc.transact(() => {
          for (const node of pageLinks) {
            const attrCode = node.getAttribute('pageCode')
            if (attrCode == null) continue
            const newCode = oldToNew.get(Number(attrCode))
            // newCode is undefined if already encrypted with newCipher or an orphan link
            if (newCode === undefined) continue
            node.setAttribute('pageCode', newCode as any)
            changed = true
          }
        })

        if (!changed) return
        totalUpdated++

        const documentName = `page:${newCipher.encrypt(pageId)}`

        // Now that we have a document that has changed, lock it so another server can't open it
        const proxyTo = await redis.set(
          `rsaLock:${documentName}`,
          SERVER_ID,
          'PX',
          10_000,
          'NX',
          'GET'
        )
        if (!proxyTo) {
          // if no other server has the doc open, just update it in the DB
          await db
            .updateTable('Page')
            .set({yDoc: Buffer.from(encodeStateAsUpdate(doc))})
            .where('id', '=', pageId)
            .execute()
        } else {
          // if the document is already open, we must send the update to that worker
          const update = encodeStateAsUpdate(doc, yDoc)
          const proxyMessage = pack({
            eventName: 'applyYjsUpdate',
            documentName,
            payload: {update},
            replyTo: `null`,
            replyId: 0,
            type: 'customEventStart'
          })
          await redis.publish(`rsaMsg:${proxyTo}`, proxyMessage)
        }
        // there are a couple race conditions here, since the migration is locking the doc, but not accepting messages for it
        // can be treated as an edge case & fixed if they refresh
        await redis.del(`rsaLock:${documentName}`)
      })
    )
  }

  redis.disconnect()
  console.log(`rekeyPageLinks: updated page links in ${totalUpdated} of ${totalPages} pages`)
}

export async function down(db: Kysely<any>): Promise<void> {}
