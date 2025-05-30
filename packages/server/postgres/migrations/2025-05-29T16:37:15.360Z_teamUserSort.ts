import {sql, type Kysely} from 'kysely'

const START_CHAR_CODE = 32
const END_CHAR_CODE = 126
function positionAfter(pos: string) {
  for (let i = pos.length - 1; i >= 0; i--) {
    const curCharCode = pos.charCodeAt(i)
    if (curCharCode < END_CHAR_CODE) {
      return pos.substr(0, i) + String.fromCharCode(curCharCode + 1)
    }
  }
  return pos + String.fromCharCode(START_CHAR_CODE + 1)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMember')
    .addColumn('sortOrder', 'varchar(128)', (col) =>
      col
        .modifyFront(sql`COLLATE pg_catalog."C"`)
        .notNull()
        // The default is just to backfill. The trigger gets the right value later
        .defaultTo('!')
    )
    .execute()

  sql`
CREATE OR REPLACE FUNCTION set_team_member_sort_order()
RETURNS TRIGGER AS $$
BEGIN
  NEW."sortOrder" := position_before(
    COALESCE(
      (SELECT MIN("sortOrder") FROM "TeamMember" WHERE "userId" = NEW."userId" AND "sortOrder" IS NOT NULL),
      '!'
    )
  );
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_set_team_member_sort_order
BEFORE INSERT ON "TeamMember"
FOR EACH ROW
EXECUTE FUNCTION set_team_member_sort_order();
  `.execute(db)

  const BATCH_SIZE = 1000
  let lastSeenUserId = ''
  for (let i = 0; i < 1e6; i++) {
    console.log('batch', i + 1)
    const userIdsResult = await db
      .selectFrom('User')
      .select('id')
      .where('id', '>', lastSeenUserId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()

    if (userIdsResult.length === 0) {
      break
    }
    const userIds = userIdsResult.map(({id}) => id)
    lastSeenUserId = userIds.at(-1)

    // Step 2: Get all TeamMember rows + team names for these users
    const teamsByUserId = await db
      .selectFrom('TeamMember')
      .innerJoin('Team', 'Team.id', 'TeamMember.teamId')
      .select((eb) => [
        eb.fn
          .agg<string[]>('array_agg', [sql.raw('"Team"."id" ORDER BY "Team"."name"')])
          .as('teamIds'),
        'TeamMember.userId'
      ])
      .where('TeamMember.userId', 'in', userIds)
      .groupBy('TeamMember.userId')
      .$call((qb) => {
        return qb
      })
      .execute()

    await Promise.all(
      teamsByUserId.map((row) => {
        const {userId, teamIds} = row
        let nextSortOrder = ' '
        return Promise.all(
          teamIds.map(async (teamId) => {
            const teamMemberId = `${userId}::${teamId}`
            const sortOrder = positionAfter(nextSortOrder)
            nextSortOrder = sortOrder
            return db
              .updateTable('TeamMember')
              .set({sortOrder})
              .where('id', '=', teamMemberId)
              .execute()
          })
        )
      })
    )
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('TeamMember').dropColumn('sortOrder').execute()
}
