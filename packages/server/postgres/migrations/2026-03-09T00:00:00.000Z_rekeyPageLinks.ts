import {type Kysely} from 'kysely'
import * as Y from 'yjs'
import {encodeStateAsUpdate, XmlElement} from 'yjs'

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

  let lastSeenId = 0
  let totalPages = 0
  let totalUpdated = 0

  for (let i = 0; i < 1e6; i++) {
    const pages = await db
      .selectFrom('Page')
      .select(['id', 'yDoc'])
      .where('yDoc', 'is not', null)
      .where('id', '>', lastSeenId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()

    if (pages.length === 0) break
    lastSeenId = pages.at(-1)!.id
    totalPages += pages.length

    await Promise.all(
      pages.map(async (page) => {
        if (!page.yDoc) return
        const doc = new Y.Doc()
        Y.applyUpdate(doc, page.yDoc)

        const frag = doc.getXmlFragment('default')
        const walker = frag.createTreeWalker(
          (node) => node instanceof XmlElement && node.nodeName === 'pageLinkBlock'
        )
        const pageLinks = Array.from(walker) as XmlElement<any>[]
        if (pageLinks.length === 0) return

        let changed = false
        doc.transact(() => {
          for (const node of pageLinks) {
            const pageCode = node.getAttribute('pageCode')
            if (pageCode == null) continue
            const dbId = oldCipher.decrypt(Number(pageCode))
            node.setAttribute('pageCode', newCipher.encrypt(dbId) as any)
            changed = true
          }
        })

        if (!changed) return
        totalUpdated++
        const newYDoc = Buffer.from(encodeStateAsUpdate(doc))
        await db.updateTable('Page').set({yDoc: newYDoc}).where('id', '=', page.id).execute()
      })
    )
  }

  console.log(`rekeyPageLinks: updated page links in ${totalUpdated} of ${totalPages} pages`)
}

export async function down(db: Kysely<any>): Promise<void> {}
