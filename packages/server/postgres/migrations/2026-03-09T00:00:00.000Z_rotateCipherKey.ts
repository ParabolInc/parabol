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
  const oldSecret = process.env.OLD_SERVER_SECRET
  const newSecret = process.env.SERVER_SECRET!
  const isRotation = oldSecret && oldSecret !== newSecret

  const newCipher = new FeistelCipher(fnv1aHash(newSecret.slice(0, 10)))
  // If no rotation, old === new so both ciphers are identical
  const oldCipher = isRotation ? new FeistelCipher(fnv1aHash(oldSecret.slice(0, 10))) : newCipher

  // Step 1: add publicId column (nullable, bigint to safely hold uint32 cipher output)
  await db.schema
    .alterTable('Page')
    .addColumn('publicId', 'bigint', (col) => col.unique())
    .execute()

  // Step 2: populate publicId using old cipher values so existing URLs remain valid.
  // Load all page IDs into a Set now for link validation later.
  const allPageIds = new Set<number>()
  let lastSeenId = 0
  for (let i = 0; i < 1e6; i++) {
    const pages: {id: number}[] = await db
      .selectFrom('Page')
      .select('id')
      .where('id', '>', lastSeenId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()

    if (pages.length === 0) break
    lastSeenId = pages.at(-1)!.id

    for (const page of pages) {
      allPageIds.add(page.id)
    }

    await Promise.all(
      pages.map((page) =>
        db
          .updateTable('Page')
          .set({publicId: oldCipher.encrypt(page.id)})
          .where('id', '=', page.id)
          .execute()
      )
    )
  }

  // Step 3: now that all rows are populated, enforce NOT NULL
  await db.schema
    .alterTable('Page')
    .alterColumn('publicId', (col) => col.setNotNull())
    .execute()

  if (!isRotation) {
    console.log('rotateCipherKey: publicId column populated, no link re-encryption needed')
    return
  }

  // Step 4: fix page links that were already re-encrypted with the new cipher before this migration.
  // Links encrypted with the old cipher are already equal to publicId, so only new-cipher links need updating.
  lastSeenId = 0
  let totalPages = 0
  let totalUpdated = 0

  for (let i = 0; i < 1e6; i++) {
    const pages: {id: number; yDoc: Buffer | null}[] = await db
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
    console.log(`rotateCipherKey: checking links in batch ${i + 1} (${totalPages} pages so far)`)

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
            const code = Number(pageCode)

            // Old-cipher links are already equal to publicId — nothing to do
            const oldDbId = oldCipher.decrypt(code)
            if (allPageIds.has(oldDbId)) continue

            // New-cipher link: update to publicId (old cipher value)
            const newDbId = newCipher.decrypt(code)
            if (allPageIds.has(newDbId)) {
              node.setAttribute('pageCode', oldCipher.encrypt(newDbId) as any)
              changed = true
            } else {
              console.warn(
                `rotateCipherKey: page ${page.id} has unresolvable pageCode ${code}, skipping`
              )
            }
          }
        })

        if (!changed) return
        totalUpdated++
        const newYDoc = Buffer.from(encodeStateAsUpdate(doc))
        await db.updateTable('Page').set({yDoc: newYDoc}).where('id', '=', page.id).execute()
      })
    )
  }

  console.log(`rotateCipherKey: done. Updated links in ${totalUpdated} of ${totalPages} pages`)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Page').dropColumn('publicId').execute()
}
