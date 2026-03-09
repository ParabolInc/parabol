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

export async function up(db: Kysely<any>): Promise<void> {
  const oldSecret = process.env.OLD_SERVER_SECRET
  const newSecret = process.env.SERVER_SECRET!
  const isRotation = oldSecret && oldSecret !== newSecret

  const newCipher = new FeistelCipher(fnv1aHash(newSecret.slice(0, 10)))
  // If no rotation, old === new so both ciphers are identical
  const oldCipher = isRotation ? new FeistelCipher(fnv1aHash(oldSecret.slice(0, 10))) : newCipher

  // Remove sequence default and set pseudorandom default so new inserts grab a 32-bit integer.
  await sql`ALTER TABLE "Page" ALTER COLUMN "id" DROP DEFAULT;`.execute(db)
  await sql`ALTER TABLE "Page" ALTER COLUMN "id" SET DEFAULT (floor(random() * 4294967295 - 2147483648)::integer);`.execute(
    db
  )

  // Step 1: Temporarily convert foreign keys referring to Page.id to have ON UPDATE CASCADE
  const fkeysResult = await sql<any>`
    SELECT
      conname AS constraint_name,
      conrelid::regclass::text AS table_name,
      a.attname AS column_name,
      confrelid::regclass::text AS foreign_table_name,
      af.attname AS foreign_column_name,
      confupdtype AS on_update,
      confdeltype AS on_delete
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
    WHERE confrelid = '"Page"'::regclass;
  `.execute(db)

  type FKRow = {
    constraint_name: string
    table_name: string
    column_name: string
    on_delete: string
  }

  const fkRows: FKRow[] = fkeysResult.rows

  // Drop and Recreate FKs with ON UPDATE CASCADE
  for (const fk of fkRows) {
    await sql`ALTER TABLE ${sql.raw(`"${fk.table_name}"`)} DROP CONSTRAINT ${sql.raw(`"${fk.constraint_name}"`)}`.execute(
      db
    )

    let onDeleteClause = ''
    if (fk.on_delete === 'c') onDeleteClause = 'ON DELETE CASCADE'
    else if (fk.on_delete === 'n') onDeleteClause = 'ON DELETE SET NULL'
    else if (fk.on_delete === 'r') onDeleteClause = 'ON DELETE RESTRICT'

    await sql`
      ALTER TABLE ${sql.raw(`"${fk.table_name}"`)}
      ADD CONSTRAINT ${sql.raw(`"${fk.constraint_name}"`)}
      FOREIGN KEY (${sql.raw(`"${fk.column_name}"`)})
      REFERENCES "Page" ("id")
      ${sql.raw(onDeleteClause)}
      ON UPDATE CASCADE
    `.execute(db)
  }

  // Step 2: Batch update Page IDs
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

    // Since FKs are ON UPDATE CASCADE, we can update them safely.
    // Bitwise OR | 0 casts the uint32 returned by Cipher into a signed 32-bit int.
    await Promise.all(
      pages.map((page) =>
        db
          .updateTable('Page')
          .set({id: oldCipher.encrypt(page.id) | 0})
          .where('id', '=', page.id)
          .execute()
      )
    )
  }

  // Step 2b: Remap ancestorIds (plain integer[], not a FK, so CASCADE doesn't apply)
  const idMap = new Map<number, number>()
  for (const oldId of allPageIds) {
    idMap.set(oldId, oldCipher.encrypt(oldId) | 0)
  }

  for (const [oldId, newId] of idMap) {
    await sql`
      UPDATE "Page"
      SET "ancestorIds" = array_replace("ancestorIds", ${oldId}, ${newId})
      WHERE ${oldId} = ANY("ancestorIds")
    `.execute(db)
  }

  if (!isRotation) {
    console.log(
      'rotateCipherKey: Page.id migrated cleanly to pseudo-random, no link re-encryption needed'
    )
    return
  }

  // Step 3: Fix page links that were already re-encrypted with the new cipher before this migration.
  lastSeenId = -2147483648 // int min
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

            // Revert new-cipher code back to the old-cipher uint representation
            const newDecryptDbId = newCipher.decrypt(code)

            if (allPageIds.has(newDecryptDbId)) {
              node.setAttribute('pageCode', oldCipher.encrypt(newDecryptDbId) as any)
              changed = true
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
  // Can not down-migrate page ID mapping successfully without breaking links
  // unless we iterate and un-cipher. Not required for now.
}
