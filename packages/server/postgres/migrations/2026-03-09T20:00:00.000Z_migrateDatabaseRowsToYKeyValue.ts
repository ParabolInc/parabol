import Redis from 'ioredis'
import type {Kysely} from 'kysely'
import {pack} from 'msgpackr'
import * as Y from 'yjs'
import {CipherId} from '../../utils/CipherId'
import {getRedisOptions} from '../../utils/getRedisOptions'

const SERVER_ID = process.env.SERVER_ID!

export async function up(db: Kysely<any>): Promise<void> {
  const redis = new Redis(process.env.REDIS_URL!, {
    ...getRedisOptions(),
    connectionName: '2026-03-09T20:00:00.000Z_migrateDatabaseRowsToYKeyValue'
  })

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
    let changed = false

    doc.transact(() => {
      data.forEach((row: any, rowId: string) => {
        if (!(row instanceof Y.Map)) return // Already new format, skip

        // Convert Y.Map<ColumnId, string> → Y.Array<{key, val}>
        const cells: {key: string; val: string | null}[] = []
        row.forEach((val: string, key: string) => {
          cells.push({key, val: val ?? null})
        })

        data.set(rowId, Y.Array.from(cells))
        changed = true
      })
    })

    if (!changed) {
      skippedCount++
      doc.destroy()
      continue
    }

    const documentName = `page:${CipherId.encrypt(pageId)}`

    // Now that we have a document that has changed, lock it so another server can't open it
    const proxyTo = await redis.set(`rsaLock:${documentName}`, SERVER_ID, 'PX', 10_000, 'NX', 'GET')
    if (!proxyTo) {
      // if no other server has the doc open, just update it in the DB
      await db
        .updateTable('Page')
        .set({yDoc: Buffer.from(Y.encodeStateAsUpdate(doc))})
        .where('id', '=', pageId)
        .execute()
      await redis.del(`rsaLock:${documentName}`)
    } else {
      // if the document is already open, we must send the update to that worker
      const update = Y.encodeStateAsUpdate(doc, yDoc)
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
    doc.destroy()
    migratedCount++
  }

  redis.disconnect()
  console.log(`Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`)
}

export async function down(_db: Kysely<any>): Promise<void> {
  // noop - rolling back the yDoc format is not worth the complexity
}
