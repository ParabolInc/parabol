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
      .table('Comment')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('Comment').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  // must truncate because some rows didn't have a threadParentId
  await sql`TRUNCATE TABLE "Comment"`.execute(pg)

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'createdAt',
    'updatedAt',
    'isActive',
    'isAnonymous',
    'threadParentId',
    'reactjis',
    'content',
    'createdBy',
    'plaintextContent',
    'discussionId',
    'threadSortOrder'
  ] as const
  type Comment = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('Comment')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as Comment[]

    const rowsToInsert = rawRowsToInsert
      .map((row) => {
        const {plaintextContent, threadSortOrder, reactjis, ...rest} = row as any
        return {
          ...rest,
          plaintextContent: plaintextContent.slice(0, 2000),
          threadSortOrder: threadSortOrder ? Math.trunc(threadSortOrder) : 0,
          reactjis: reactjis?.map((r: any) => `(${r.id},${r.userId})`) ?? []
        }
      })
      .filter((row) => row.discussionId)

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    await Promise.all(
      rowsToInsert.map(async (row) => {
        try {
          await pg
            .insertInto('Comment')
            .values(row)
            .onConflict((oc) => oc.doNothing())
            .execute()
        } catch (e) {
          if (e.constraint === 'fk_createdBy') {
            await pg
              .insertInto('Comment')
              .values({...row, createdBy: null})
              .onConflict((oc) => oc.doNothing())
              .execute()
            return
          }
          if (e.constraint === 'fk_discussionId') {
            console.log(`Skipping ${row.id} because it has no discussion`)
            return
          }
          console.log(e, row)
        }
      })
    )
  }

  // if the threadParentId references an id that does not exist, set it to null
  console.log('adding threadParentId constraint')
  await pg
    .updateTable('Comment')
    .set({threadParentId: null})
    .where(({eb, selectFrom}) =>
      eb(
        'id',
        'in',
        selectFrom('Comment as child')
          .select('child.id')
          .leftJoin('Comment as parent', 'child.threadParentId', 'parent.id')
          .where('parent.id', 'is', null)
          .where('child.threadParentId', 'is not', null)
      )
    )
    .execute()
  await pg.schema
    .alterTable('Comment')
    .addForeignKeyConstraint('fk_threadParentId', ['threadParentId'], 'Comment', ['id'])
    .onDelete('set null')
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "Comment" CASCADE`.execute(pg)
}
