import {type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('TeamDetail')
    .addColumn('id', 'varchar(100)', (col) =>
      col.primaryKey().references('Team.id').onDelete('cascade')
    )
    .addColumn('groupingBriefing', 'text')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('TeamDetail').execute()
}
