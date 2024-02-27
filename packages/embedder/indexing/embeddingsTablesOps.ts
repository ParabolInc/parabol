import {Insertable, Selectable, Updateable, sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import {DBInsert} from '../embedder'
import {RawBuilder} from 'kysely'
import numberVectorToString from './numberVectorToString'

function unnestedArray<T>(maybeArray: T[] | T): RawBuilder<T> {
  let a: T[] = Array.isArray(maybeArray) ? maybeArray : [maybeArray]
  return sql`unnest(ARRAY[${sql.join(a)}]::varchar[])`
}

export const selectJobQueueItemById = async (
  id: number
): Promise<Selectable<DB['EmbeddingsJobQueue']> | undefined> => {
  const pg = getKysely()
  return pg.selectFrom('EmbeddingsJobQueue').selectAll().where('id', '=', id).executeTakeFirst()
}
export const selectMetadataByJobQueueId = async (
  id: number
): Promise<Selectable<DB['EmbeddingsMetadata']> | undefined> => {
  const pg = getKysely()
  return pg
    .selectFrom('EmbeddingsMetadata as em')
    .selectAll()
    .leftJoin('EmbeddingsJobQueue as ejq', (join) =>
      join.onRef('em.objectType', '=', 'ejq.objectType').onRef('em.refId', '=', 'ejq.refId')
    )
    .where('ejq.id', '=', id)
    .executeTakeFirstOrThrow()
}

// For each configured embedding model, select rows from EmbeddingsMetadata
// that haven't been calculated nor exist in the EmbeddingsJobQueue yet
//
// Notes:
//   * `em.models @> ARRAY[v.model]` is an indexed query
//   * I don't love all overrides, I wish there was a better way
//     see: https://github.com/kysely-org/kysely/issues/872
export async function selectMetaToQueue(
  configuredModels: string[],
  orgIds: any[],
  itemCountToQueue: number
) {
  const pg = getKysely()
  const maybeMetaToQueue = (await pg
    .selectFrom('EmbeddingsMetadata as em')
    .selectAll('em')
    .leftJoinLateral(unnestedArray(configuredModels).as('model'), (join) => join.onTrue())
    .leftJoin('Team as t', 'em.teamId', 't.id')
    .select('model' as any)
    .where(({eb, not, or, and, exists, selectFrom}) =>
      and([
        or([
          not(eb('em.models', '<@', sql`ARRAY[${sql.ref('model')}]::varchar[]` as any) as any),
          eb('em.models' as any, 'is', null)
        ]),
        not(
          exists(
            selectFrom('EmbeddingsJobQueue as ejq')
              .select('ejq.id')
              .whereRef('em.objectType', '=', 'ejq.objectType')
              .whereRef('em.refId', '=', 'ejq.refId')
              .whereRef('ejq.model', '=', 'model' as any)
          )
        ),
        eb('t.orgId', 'in', orgIds)
      ])
    )
    .limit(itemCountToQueue)
    .execute()) as unknown as Selectable<DB['EmbeddingsMetadata'] & {model: string}>[]

  type MetadataToQueue = Selectable<
    Omit<DB['EmbeddingsMetadata'], 'refId'> & {
      refId: NonNullable<DB['EmbeddingsMetadata']['refId']>
    } & {model: string}
  >

  return maybeMetaToQueue.filter(
    (item) => item.refId !== null && item.refId !== undefined
  ) as MetadataToQueue[]
}

export const updateJobState = async (
  id: number,
  state: Updateable<DB['EmbeddingsJobQueue']>['state'],
  jobQueueFields: Updateable<DB['EmbeddingsJobQueue']> = {}
) => {
  const pg = getKysely()
  const jobQueueColumns: Updateable<DB['EmbeddingsJobQueue']> = {
    ...jobQueueFields,
    state
  }
  if (state === 'failed') console.log(`embedder: failed job ${id}, ${jobQueueFields.stateMessage}`)
  return pg
    .updateTable('EmbeddingsJobQueue')
    .set(jobQueueColumns)
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

export function insertNewJobs(ejqValues: Insertable<DB['EmbeddingsJobQueue']>[]) {
  const pg = getKysely()
  return pg
    .insertInto('EmbeddingsJobQueue')
    .values(ejqValues)
    .returning(['id', 'objectType', 'refId'])
    .execute()
}

// complete job, do the following atomically
// (1) update EmbeddingsMetadata to reflect model completion
// (2) upsert model table row with embedding
// (3) delete EmbeddingsJobQueue row
export function completeJobTxn(
  modelTable: string,
  jobQueueId: number,
  metadata: Updateable<DB['EmbeddingsMetadata']>,
  fullText: string,
  embedText: string,
  embeddingVector: number[]
) {
  const pg = getKysely()
  return pg.transaction().execute(async (trx) => {
    // get fields to update correct metadata row
    const jobQueueItem = await trx
      .selectFrom('EmbeddingsJobQueue')
      .select(['objectType', 'refId', 'model'])
      .where('id', '=', jobQueueId)
      .executeTakeFirstOrThrow()

    // (1) update metadata row
    const metadataColumnsToUpdate: {
      models: RawBuilder<string[]>
      fullText?: string | null | undefined
    } = {
      // update models as a set
      models: sql<string[]>`(
SELECT array_agg(DISTINCT value)
FROM (
  SELECT unnest(COALESCE("models", '{}')) AS value
  UNION
  SELECT unnest(ARRAY[${modelTable}]::VARCHAR[]) AS value
) AS combined_values
)`
    }

    if (metadata?.fullText !== fullText) {
      metadataColumnsToUpdate.fullText = fullText
    }

    const updatedMetadata = await trx
      .updateTable('EmbeddingsMetadata')
      .set(metadataColumnsToUpdate)
      .where('objectType', '=', jobQueueItem.objectType)
      .where('refId', '=', jobQueueItem.refId)
      .returning(['id'])
      .executeTakeFirstOrThrow()

    // (2) upsert into model table
    await trx
      .insertInto(modelTable as any)
      .values({
        embedText: fullText !== embedText ? embedText : null,
        embedding: numberVectorToString(embeddingVector),
        embeddingsMetadataId: updatedMetadata.id
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet((eb) => ({
          embedText: eb.ref('excluded.embedText'),
          embeddingsMetadataId: eb.ref('excluded.embeddingsMetadataId')
        }))
      )
      .executeTakeFirstOrThrow()

    // (3) delete completed job queue item
    return await trx
      .deleteFrom('EmbeddingsJobQueue')
      .where('id', '=', jobQueueId)
      .executeTakeFirstOrThrow()
  })
}
export async function upsertEmbeddingsMetaRows(
  embeddingsMetaRows: DBInsert['EmbeddingsMetadata'][]
) {
  const pg = getKysely()
  return pg
    .insertInto('EmbeddingsMetadata')
    .values(embeddingsMetaRows)
    .onConflict((oc) =>
      oc.columns(['objectType', 'refId']).doUpdateSet((eb) => ({
        objectType: eb.ref('excluded.objectType'),
        refId: eb.ref('excluded.refId'),
        refUpdatedAt: eb.ref('excluded.refUpdatedAt')
      }))
    )
    .execute()
}
