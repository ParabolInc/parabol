import type {Kysely} from 'kysely'
import * as Y from 'yjs'

export async function up(db: Kysely<any>): Promise<void> {
  const pages = await db
    .selectFrom('Page')
    .select(['id', 'yDoc'])
    .where('isDatabase', '=', true)
    .where('deletedAt', 'is', null)
    .execute()

  console.log(`Found ${pages.length} database pages to migrate`)
  if (pages.length === 0) return

  let migratedCount = 0
  let skippedCount = 0

  for (const {id: pageId, yDoc} of pages) {
    if (!yDoc) {
      skippedCount++
      continue
    }

    const doc = new Y.Doc()
    Y.applyUpdate(doc, yDoc)

    const data = doc.getMap<any>('data')
    let modified = false

    doc.transact(() => {
      data.forEach((row: any, rowId: string) => {
        if (!(row instanceof Y.Map)) return // Already new format, skip

        // Convert Y.Map<ColumnId, string> → Y.Array<{key, val}>
        const cells: {key: string; val: string | null}[] = []
        row.forEach((val: string, key: string) => {
          cells.push({key, val: val ?? null})
        })

        data.set(rowId, Y.Array.from(cells))
        modified = true
      })
    })

    if (!modified) {
      skippedCount++
      continue
    }

    await db
      .updateTable('Page')
      .set({yDoc: Buffer.from(Y.encodeStateAsUpdate(doc))})
      .where('id', '=', pageId)
      .execute()

    migratedCount++
  }

  console.log(`Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`)
}

export async function down(_db: Kysely<any>): Promise<void> {
  // noop - rolling back the yDoc format is not worth the complexity
}
