import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE IF NOT EXISTS 'clickup'`.execute(
    db
  )
}

export async function down(_db: Kysely<any>): Promise<void> {}
