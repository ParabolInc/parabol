import {Kysely, PostgresDialect, sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  try {
    console.log('Adding index')
    await r
      .table('Task')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('Task').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'content',
    'createdAt',
    'createdBy',
    'doneMeetingId',
    'dueDate',
    'integration',
    'integrationHash',
    'meetingId',
    'plaintextContent',
    'sortOrder',
    'status',
    'tags',
    'teamId',
    'discussionId',
    'threadParentId',
    'threadSortOrder',
    'updatedAt',
    'userId'
  ] as const
  type Task = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval

  const insertRow = async (row) => {
    try {
      await pg
        .insertInto('Task')
        .values(row)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      if (e.constraint === 'fk_teamId') {
        console.log('Task has no team, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_meetingId') {
        console.log('Task has no meeting, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_discussionId') {
        console.log('Task has no discussionId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_createdBy') {
        console.log('Task has no createdBy user, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_doneMeetingId') {
        console.log('Task has no doneMeetingId user, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_userId') {
        console.log('Task has no userId user, skipping insert', row.id)
        return
      }
      if (e.message.includes('invalid input value for enum "TaskTagEnum"')) {
        console.log('Task has invalid enum, skipping insert', row.id)
        return
      }
      throw e
    }
  }
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('Task')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as Task[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {
        id,
        content,
        createdAt,
        createdBy,
        doneMeetingId,
        dueDate,
        integration,
        integrationHash,
        meetingId,
        plaintextContent,
        sortOrder,
        status,
        tags,
        teamId,
        discussionId,
        threadParentId,
        threadSortOrder,
        updatedAt,
        userId
      } = row as any
      return {
        id,
        content: JSON.stringify(content),
        createdAt,
        createdBy,
        doneMeetingId,
        dueDate,
        integration: JSON.stringify(integration),
        integrationHash,
        meetingId,
        plaintextContent: plaintextContent.slice(0, 2000),
        sortOrder,
        status,
        tags,
        teamId,
        discussionId,
        threadParentId,
        threadSortOrder: threadSortOrder ? Math.round(threadSortOrder) : null,
        updatedAt,
        userId
      }
    })

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    await Promise.all(rowsToInsert.map(async (row) => insertRow(row)))
  }
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "Task" CASCADE`.execute(pg)
}
