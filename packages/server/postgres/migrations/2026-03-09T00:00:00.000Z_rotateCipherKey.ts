import {type Kysely, sql} from 'kysely'
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

// All FK constraints referencing Page(id), derived from the migrations schema.
// Constraint names follow Postgres convention: {table}_{column}_fkey
const PAGE_ID_FKS = [
  // 2025-05-12_RBAC.ts
  {table: 'PageExternalAccess', column: 'pageId', onDelete: 'cascade' as const},
  {table: 'PageUserAccess', column: 'pageId', onDelete: 'cascade' as const},
  {table: 'PageTeamAccess', column: 'pageId', onDelete: 'cascade' as const},
  {table: 'PageOrganizationAccess', column: 'pageId', onDelete: 'cascade' as const},
  {table: 'PageAccess', column: 'pageId', onDelete: 'cascade' as const},
  {table: 'PageUserSortOrder', column: 'pageId', onDelete: 'cascade' as const},
  {table: 'Page', column: 'parentPageId', onDelete: 'cascade' as const}, // self-referential
  // 2025-06-18_PageBacklink.ts
  {table: 'PageBacklink', column: 'fromPageId', onDelete: 'cascade' as const},
  {table: 'PageBacklink', column: 'toPageId', onDelete: 'cascade' as const},
  // 2025-07-25_newMeeting-summaryPageId.ts
  {table: 'NewMeeting', column: 'summaryPageId', onDelete: 'set null' as const},
  // 2025-09-02_addSharePageNotifications.ts
  {table: 'Notification', column: 'pageId', onDelete: 'cascade' as const},
  // 2025-10-30_addPageAccessRequest.ts
  {table: 'PageAccessRequest', column: 'pageId', onDelete: 'cascade' as const},
  // 2026-02-20_meetingTOCPage.ts
  {table: 'Team', column: 'meetingTOCpageId', onDelete: 'set null' as const}
]

export async function up(db: Kysely<any>): Promise<void> {
  const oldSecret = process.env.OLD_SERVER_SECRET
  const newSecret = process.env.SERVER_SECRET!
  const isRotation = oldSecret && oldSecret !== newSecret

  const newCipher = new FeistelCipher(fnv1aHash(newSecret.slice(0, 10)))
  // If no rotation, old === new so both ciphers are identical
  const oldCipher = isRotation ? new FeistelCipher(fnv1aHash(oldSecret.slice(0, 10))) : newCipher

  // Change the default from sequential to pseudorandom for future inserts
  await db.schema
    .alterTable('Page')
    .alterColumn('id', (col) => col.dropDefault())
    .execute()
  await db.schema
    .alterTable('Page')
    .alterColumn('id', (col) =>
      col.setDefault(sql`floor(random() * 4294967295 - 2147483648)::integer`)
    )
    .execute()

  // Step 1: Temporarily add ON UPDATE CASCADE to all FKs referencing Page.id
  // so that the ID updates in Step 2 propagate automatically.
  for (const fk of PAGE_ID_FKS) {
    const name = `${fk.table}_${fk.column}_fkey`
    await db.schema.alterTable(fk.table).dropConstraint(name).execute()
    await db.schema
      .alterTable(fk.table)
      .addForeignKeyConstraint(name, [fk.column], 'Page', ['id'])
      .onDelete(fk.onDelete)
      .onUpdate('cascade')
      .execute()
  }

  // Step 2: Batch-encrypt all Page.ids. FKs cascade automatically.
  // idMap tracks oldId → newId for ancestorIds remapping and yDoc link fixing.
  // Fetch all IDs upfront so pagination isn't affected by the ID updates themselves.
  const allPages = await db.selectFrom('Page').select('id').execute()
  const idMap = new Map(allPages.map((page) => [page.id, oldCipher.encrypt(page.id) | 0]))

  for (let i = 0; i < allPages.length; i += BATCH_SIZE) {
    await Promise.all(
      allPages.slice(i, i + BATCH_SIZE).map((page) =>
        db
          .updateTable('Page')
          .set({id: idMap.get(page.id)!})
          .where('id', '=', page.id)
          .execute()
      )
    )
  }

  // Step 2b: Remap ancestorIds (plain integer[], not a FK, so CASCADE doesn't apply)
  for (const [oldId, newId] of idMap) {
    await db
      .updateTable('Page')
      .set({ancestorIds: sql`array_replace("ancestorIds", ${oldId}, ${newId})`})
      .where(sql`${oldId} = ANY("ancestorIds")`)
      .execute()
  }

  if (!isRotation) {
    console.log(
      'rotateCipherKey: Page.id migrated cleanly to pseudo-random, no link re-encryption needed'
    )
    return
  }

  // Step 3: Fix page links that were already re-encrypted with the new cipher before this migration.
  let scanLastSeenId = -2147483648 // int min
  let totalPages = 0
  let totalUpdated = 0

  for (let i = 0; i < 1e6; i++) {
    const pages = await db
      .selectFrom('Page')
      .select(['id', 'yDoc'])
      .where('yDoc', 'is not', null)
      .where('id', '>', scanLastSeenId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()

    if (pages.length === 0) break
    scanLastSeenId = pages.at(-1)!.id
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

            // Revert new-cipher code back to the old-cipher uint representation
            const oldId = newCipher.decrypt(code)
            const newId = idMap.get(oldId)
            if (newId === undefined) continue

            node.setAttribute('pageCode', (newId >>> 0) as any)
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

  console.log(`rotateCipherKey: done. Updated links in ${totalUpdated} of ${totalPages} pages`)
}

export async function down(db: Kysely<any>): Promise<void> {
  // Can not down-migrate page ID mapping successfully without breaking links
  // unless we iterate and un-cipher. Not required for now.
}
