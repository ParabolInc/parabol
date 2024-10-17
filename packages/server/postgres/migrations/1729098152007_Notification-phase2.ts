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
      .table('Notification')
      .indexCreate('updatedAtId', (row: any) => [row('createdAt'), row('id')])
      .run()
    await r.table('Notification').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'status',
    'createdAt',
    'type',
    'userId',
    'meetingId',
    'authorId',
    'commentId',
    'discussionId',
    'teamId',
    'evictorUserId',
    'senderName',
    'senderPicture',
    'senderUserId',
    'meetingName',
    'retroReflectionId',
    'retroDiscussStageIdx',
    'orgId',
    'last4',
    'brand',
    'activeDomain',
    'domainJoinRequestId',
    'email',
    'name',
    'picture',
    'requestCreatedBy',
    'responseId',
    'changeAuthorId',
    'involvement',
    'taskId',
    'archivorUserId',
    'invitationId',
    'orgName',
    'orgPicture',
    'scheduledLockAt'
  ] as const
  type Notification = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval

  const insertRow = async (row) => {
    if (!row.type) {
      console.log('Notification has no type, skipping insert', row.id)
      return
    }
    try {
      await pg
        .insertInto('Notification')
        .values(row)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      if (e.constraint === 'fk_meetingId') {
        console.log('Notification has no meeting, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_userId') {
        console.log('Notification has no user, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_changeAuthorId') {
        console.log('Notification has no fk_changeAuthorId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_taskId') {
        console.log('Notification has no fk_taskId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_archivorUserId') {
        console.log('Notification has no fk_archivorUserId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_orgId') {
        console.log('Notification has no fk_orgId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_evictorUserId') {
        console.log('Notification has no fk_evictorUserId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_invitationId') {
        console.log('Notification has no fk_invitationId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_responseId') {
        console.log('Notification has no fk_responseId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_authorId') {
        console.log('Notification has no fk_authorId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_commentId') {
        console.log('Notification has no fk_commentId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_teamId') {
        console.log('Notification has no fk_teamId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_discussionId') {
        console.log('Notification has no fk_discussionId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_senderUserId') {
        console.log('Notification has no fk_senderUserId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_retroReflectionId') {
        console.log('Notification has no fk_retroReflectionId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_domainJoinRequestId') {
        console.log('Notification has no fk_domainJoinRequestId, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_requestCreatedBy') {
        console.log('Notification has no fk_requestCreatedBy, skipping insert', row.id)
        return
      }
      throw e
    }
  }
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('Notification')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as Notification[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {responseId, ...rest} = row as any
      return {
        ...rest,
        responseId: responseId ? Number(responseId.split(':')[1]) : null
      }
    })

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.createdAt
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
  await sql`TRUNCATE TABLE "Notification" CASCADE`.execute(pg)
}
