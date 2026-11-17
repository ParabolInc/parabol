import type {Transaction} from 'kysely'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {importHistoricalMeetingTemplates} from '../../../embedder/importHistoricalMeetingTemplates'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import type {DB} from '../../postgres/types/pg'

const pg = getKysely()
const orgId = `importTemplatesOrg${generateUID()}`
const teamId = `importTemplatesTeam${generateUID()}`

class Rollback extends Error {}

const withRollback = async (run: (trx: Transaction<DB>) => Promise<void>) => {
  await pg
    .transaction()
    .execute(async (trx) => {
      await trx
        .insertInto('Organization')
        .values({id: orgId, name: 'Import org', tier: 'team'})
        .execute()
      await trx.insertInto('Team').values({id: teamId, name: 'Import team', orgId}).execute()
      await run(trx)
      throw new Rollback()
    })
    .catch((error) => {
      if (!(error instanceof Rollback)) throw error
    })
}

const insertTemplate = async (trx: Transaction<DB>, isActive = true) => {
  const id = `importTemplate${generateUID()}`
  await trx
    .insertInto('MeetingTemplate')
    .values({
      id,
      name: 'Added after the first import',
      teamId,
      orgId,
      scope: 'PUBLIC',
      type: 'teamHealth',
      mainCategory: 'teamHealth',
      illustrationUrl: 'https://example.com/template.png',
      isActive
    })
    .execute()
  return id
}

const metadataRows = (trx: Transaction<DB>, refId: string) =>
  trx
    .selectFrom('EmbeddingsMetadata')
    .select('id')
    .where('refId', '=', refId)
    .where('objectType', '=', 'meetingTemplate')
    .execute()

afterAll(async () => {
  await pg.destroy()
})

it('adds a template that arrived after the first import, and queues it', async () => {
  await withRollback(async (trx) => {
    const templateId = await insertTemplate(trx)
    await importHistoricalMeetingTemplates(trx)
    const [metadata] = await metadataRows(trx, templateId)
    expect(metadata).toBeDefined()
    const jobs = await trx
      .selectFrom('EmbeddingsJobQueueV2')
      .select(['jobType', 'modelId'])
      .where('embeddingsMetadataId', '=', metadata!.id)
      .execute()
    expect(jobs).toEqual([{jobType: 'embed:start', modelId: activeEmbeddingModelId}])
  })
})

it('adds nothing the second time', async () => {
  await withRollback(async (trx) => {
    const templateId = await insertTemplate(trx)
    await importHistoricalMeetingTemplates(trx)
    const [metadata] = await metadataRows(trx, templateId)
    const queuedJobs = () =>
      trx
        .selectFrom('EmbeddingsJobQueueV2')
        .select('id')
        .where('embeddingsMetadataId', '=', metadata!.id)
        .execute()
    const firstRunJobs = await queuedJobs()
    await importHistoricalMeetingTemplates(trx)
    expect(await metadataRows(trx, templateId)).toHaveLength(1)
    expect(await queuedJobs()).toHaveLength(firstRunJobs.length)
  })
})

it('leaves out a deleted template', async () => {
  await withRollback(async (trx) => {
    const templateId = await insertTemplate(trx, false)
    await importHistoricalMeetingTemplates(trx)
    expect(await metadataRows(trx, templateId)).toHaveLength(0)
  })
})
