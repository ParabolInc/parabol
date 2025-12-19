import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema
      // Transient failures get assigned a priority penalty.
      // Permanenent failures get moved to another table for research
      .createTable('EmbeddingsFailures')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('embeddingsMetadataId', 'integer', (col) =>
        col.references('EmbeddingsMetadata.id').onDelete('cascade').notNull()
      )
      .addColumn('model', 'varchar(255)', (col) => col.notNull())
      .addColumn('message', 'varchar(8192)', (col) => col.notNull())
      .addColumn('retryCount', 'smallint', (col) => col.notNull())
      .addColumn('lastFailedAt', 'timestamptz', (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute(),
    db.schema
      .createTable('EmbeddingsJobQueueV2')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('updatedAt', 'timestamptz', (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn('startAt', 'timestamptz')
      .addColumn('state', sql`"EmbeddingsJobStateEnum"`, (col) => col.defaultTo('queued').notNull())
      .addColumn('stateMessage', 'varchar(8192)')
      .addColumn('retryCount', 'smallint', (col) => col.defaultTo(0).notNull())
      .addColumn('priority', 'integer', (col) => col.notNull())
      .addColumn('jobData', 'jsonb', (col) => col.defaultTo('{}').notNull())
      .addColumn('jobType', 'varchar(255)', (col) => col.notNull())
      .addColumn('model', 'varchar(255)', (col) => col.notNull())
      .addColumn('embeddingsMetadataId', 'integer', (col) =>
        col.references('EmbeddingsMetadata.id').onDelete('cascade').notNull()
      )
      .execute()
  ])

  await Promise.all([
    db.schema
      .createIndex('idx_EmbeddingsJobQueueV2_priority_id')
      .on('EmbeddingsJobQueueV2')
      .column('priority')
      // Include id as secondary index to make an Index-Only Scan
      .column('id')
      .where('state' as any, '=', 'queued')
      .execute(),
    // Reduce fill factor for Heap Only Tuple (HOT) updates
    sql`ALTER TABLE "EmbeddingsJobQueueV2" SET (fillfactor = 70);`.execute(db)
  ])
}

export async function down(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.dropTable('EmbeddingsFailures').execute(),
    db.schema.dropTable('EmbeddingsJobQueueV2').execute()
  ])
}
