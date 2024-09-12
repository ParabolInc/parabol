import {Kysely, PostgresDialect, sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

const START_CHAR_CODE = 32
const END_CHAR_CODE = 126

export function positionAfter(pos: string) {
  for (let i = pos.length - 1; i >= 0; i--) {
    const curCharCode = pos.charCodeAt(i)
    if (curCharCode < END_CHAR_CODE) {
      return pos.substr(0, i) + String.fromCharCode(curCharCode + 1)
    }
  }
  return pos + String.fromCharCode(START_CHAR_CODE + 1)
}

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
      .table('ReflectPrompt')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('ReflectPrompt').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'createdAt',
    'updatedAt',
    'removedAt',
    'description',
    'groupColor',
    'sortOrder',
    'question',
    'teamId',
    'templateId',
    'parentPromptId'
  ] as const
  type ReflectPrompt = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('ReflectPrompt')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as ReflectPrompt[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {description, groupColor, sortOrder, question, ...rest} = row as any
      return {
        ...rest,
        description: description?.slice(0, 256) ?? '',
        groupColor: groupColor?.slice(0, 9) ?? '#66BC8C',
        sortOrder: String(sortOrder),
        question: question?.slice(0, 100) ?? ''
      }
    })

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    await Promise.all(
      rowsToInsert.map(async (row) => {
        try {
          await pg
            .insertInto('ReflectPrompt')
            .values(row)
            .onConflict((oc) => oc.doNothing())
            .execute()
        } catch (e) {
          if (e.constraint === 'fk_templateId' || e.constraint === 'fk_teamId') {
            console.log('Missing templateId or teamId', row.id)
            return
          }
          console.log(e, row)
        }
      })
    )
  }

  // remap the sortOrder in PG because rethinkdb is too slow to group
  console.log('Correcting sortOrder')
  const pgRows = await sql<{items: {sortOrder: string; id: string}[]}>`
    select jsonb_agg(jsonb_build_object('sortOrder', "sortOrder", 'id', "id", 'templateId', "templateId") ORDER BY "sortOrder") items from "ReflectPrompt"
group by "templateId";`.execute(pg)

  const groups = pgRows.rows.map((row) => {
    const {items} = row
    let curSortOrder = ''
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      curSortOrder = positionAfter(curSortOrder)
      item.sortOrder = curSortOrder
    }
    return row
  })
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await Promise.all(
      group.items.map((item) => {
        return pg
          .updateTable('ReflectPrompt')
          .set({sortOrder: item.sortOrder})
          .where('id', '=', item.id)
          .execute()
      })
    )
  }

  // if the threadParentId references an id that does not exist, set it to null
  console.log('adding parentPromptId constraint')
  await pg
    .updateTable('ReflectPrompt')
    .set({parentPromptId: null})
    .where(({eb, selectFrom}) =>
      eb(
        'id',
        'in',
        selectFrom('ReflectPrompt as child')
          .select('child.id')
          .leftJoin('ReflectPrompt as parent', 'child.parentPromptId', 'parent.id')
          .where('parent.id', 'is', null)
          .where('child.parentPromptId', 'is not', null)
      )
    )
    .execute()
  await pg.schema
    .alterTable('ReflectPrompt')
    .addForeignKeyConstraint('fk_parentPromptId', ['parentPromptId'], 'ReflectPrompt', ['id'])
    .onDelete('set null')
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "ReflectPrompt" CASCADE`.execute(pg)
}
