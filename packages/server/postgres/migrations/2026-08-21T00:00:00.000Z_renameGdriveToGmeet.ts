import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME VALUE 'gdrive' TO 'gmeet'`.execute(
    db
  )
  await db
    .updateTable('IntegrationProvider')
    .set({serverBaseUrl: 'https://meet.googleapis.com/v2'})
    .where('service', '=', 'gmeet')
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('IntegrationProvider')
    .set({serverBaseUrl: 'https://www.googleapis.com/drive/v3'})
    .where('service', '=', 'gmeet')
    .execute()
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME VALUE 'gmeet' TO 'gdrive'`.execute(
    db
  )
}
