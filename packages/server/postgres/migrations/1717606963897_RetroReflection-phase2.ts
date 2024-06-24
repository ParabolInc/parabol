import {ContentState, convertToRaw} from 'draft-js'
import {Kysely, PostgresDialect, sql} from 'kysely'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

const convertTextToRaw = (text: string) => {
  // plaintextContent can have a bunch of linebreaks like \n which get converted into new blocks.
  // New blocks take up a BUNCH of space, so we'd rather preserve as much plaintextContent as possible.
  const spaceFreeText = text
    .split(/\s/)
    .filter((s) => s.length)
    .join(' ')
  const contentState = ContentState.createFromText(spaceFreeText)
  const raw = convertToRaw(contentState)
  return JSON.stringify(raw)
}

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  try {
    await r
      .table('RetroReflection')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('RetroReflection').indexWait().run()
  } catch {
    // index already exists
  }

  const MAX_PG_PARAMS = 65545

  const PG_COLS = [
    'id',
    'createdAt',
    'updatedAt',
    'isActive',
    'meetingId',
    'promptId',
    'sortOrder',
    'creatorId',
    'content',
    'plaintextContent',
    'entities',
    'sentimentScore',
    'reactjis',
    'reflectionGroupId'
  ] as const
  type RetroReflection = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  const capContent = (content: string, plaintextContent: string) => {
    let nextPlaintextContent = plaintextContent || extractTextFromDraftString(content)
    // if they got out of hand with formatting, extract the text & convert it back
    let nextContent = content.length <= 2000 ? content : convertTextToRaw(nextPlaintextContent)
    while (nextContent.length > 2000 || nextPlaintextContent.length > 2000) {
      const maxLen = Math.max(nextContent.length, nextPlaintextContent.length)
      const overage = maxLen - 2000
      const stopIdx = nextPlaintextContent.length - overage - 1
      nextPlaintextContent = nextPlaintextContent.slice(0, stopIdx)
      nextContent = convertTextToRaw(nextPlaintextContent)
    }
    return {content: nextContent, plaintextContent: nextPlaintextContent}
  }

  let curUpdatedAt = r.minval
  let curId = r.minval

  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, curUpdatedAt, curId)
    const rawRowsToInsert = (await r
      .table('RetroReflection')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as RetroReflection[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const nonzeroEntities = row.entities?.length > 0 ? row.entities : undefined
      const normalizedEntities = nonzeroEntities?.map((e: any) => ({
        ...e,
        salience: typeof e.salience === 'number' ? e.salience : 0
      }))
      return {
        ...row,
        ...capContent(row.content, row.plaintextContent),
        reactjis: row.reactjis?.map((r: any) => `(${r.id},${r.userId})`),
        entities: normalizedEntities
          ? sql`(select array_agg((name, salience, lemma)::"GoogleAnalyzedEntity") from json_populate_recordset(null::"GoogleAnalyzedEntity", ${JSON.stringify(normalizedEntities)}))`
          : undefined
      }
    })
    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    let isFailure = false
    // NOTE: This migration inserts row-by-row because there are so many referential integrity errors
    // Do not copy this migration logic for future migrations, it is slow!
    const insertSingleRow = async (row: RetroReflection) => {
      if (isFailure) return
      try {
        await pg
          .insertInto('RetroReflection')
          .values(row)
          .onConflict((oc) => oc.doNothing())
          .execute()
      } catch (e) {
        if (e.constraint === 'fk_reflectionGroupId') {
          await pg
            .insertInto('RetroReflectionGroup')
            .values({
              id: row.reflectionGroupId,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              isActive: row.isActive,
              meetingId: row.meetingId,
              promptId: row.promptId
            })
            // multiple reflections may be trying to create the same group
            .onConflict((oc) => oc.doNothing())
            .execute()
          await insertSingleRow(row)
        } else if (e.constraint === 'fk_creatorId') {
          await r.table('RetroReflection').get(row.id).update({creatorId: null}).run()
          await insertSingleRow({...row, creatorId: null})
        } else {
          isFailure = true
          console.log(e, row)
        }
      }
    }
    await Promise.all(rowsToInsert.map(insertSingleRow))
    if (isFailure) {
      throw 'Failed batch'
    }
  }
}

export async function down() {
  await connectRethinkDB()
  try {
    await r.table('RetroReflection').indexDrop('updatedAtId').run()
  } catch {
    // index already dropped
  }
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.deleteFrom('RetroReflection').execute()
}
