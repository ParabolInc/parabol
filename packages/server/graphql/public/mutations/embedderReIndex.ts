import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getModelManager from '../../../../embedder/ai_models/ModelManager'
import {getEmbedderPriority} from '../../../../embedder/getEmbedderPriority'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const BATCH_SIZE = 100

const embedderReIndex: MutationResolvers['embedderReIndex'] = async (_source, {orgIds}) => {
  const pg = getKysely()
  let queuedCount = 0

  const modelManager = getModelManager()
  const tableNames = [...modelManager.embeddingModels.keys()]

  const allowedOrgs = await pg
    .selectFrom('FeatureFlagOwner as ffo')
    .innerJoin('FeatureFlag as ff', 'ff.id', 'ffo.featureFlagId')
    .where('ffo.orgId', 'in', orgIds)
    .where('ff.featureName', '=', 'search')
    .where('ff.expiresAt', '>', new Date())
    .select('ffo.orgId')
    .execute()

  const allowedOrgIds = allowedOrgs.map((row) => row.orgId).filter((id): id is string => !!id)

  if (allowedOrgIds.length === 0) {
    throw new GraphQLError('Search is not enabled for this organization')
  }

  // 1. Get all Teams in these Orgs
  const teams = await pg
    .selectFrom('Team')
    .select('id')
    .where('orgId', 'in', allowedOrgIds)
    .execute()
  const teamIds = teams.map((t) => t.id)

  // 1b. Get all Users in these Orgs (for Private Pages)
  const orgUsers = await pg
    .selectFrom('OrganizationUser')
    .select('userId')
    // uncomment and swap where clause when feature flag is removed
    //    .where('orgId', 'in', orgIds)
    .where('orgId', 'in', allowedOrgIds)
    .execute()
  const orgUserIds = orgUsers.map((u) => u.userId)

  if (teams.length === 0 && orgUserIds.length === 0) {
    return {success: true, queuedCount: 0}
  }

  // 2. Discover Objects
  // 2a. Pages
  const pages = await pg
    .selectFrom('Page')
    .select(['id', 'teamId', 'userId'])
    .where((eb) => {
      const filters = []
      if (teamIds.length > 0) {
        filters.push(eb('teamId', 'in', teamIds))
      }
      if (orgUserIds.length > 0) {
        filters.push(eb.and([eb('userId', 'in', orgUserIds), eb('teamId', 'is', null)]))
      }
      return eb.or(filters)
    })
    .execute()

  // 2b. Meeting Templates
  const templates = await pg
    .selectFrom('MeetingTemplate')
    .select(['id', 'teamId'])
    .where('teamId', 'in', teamIds)
    .execute()

  // 2c. Discussions (Retrospectives)
  const discussions = await pg
    .selectFrom('Discussion')
    .select(['id', 'teamId'])
    .where('teamId', 'in', teamIds)
    .where('discussionTopicType', '=', 'reflectionGroup')
    .execute()

  const timestamp = new Date()
  const priority = getEmbedderPriority(1)

  // Helper to process a batch
  const processBatch = async (
    items: {
      id: string
      teamId: string | number | null
      userId?: string | null
      objectType: string
    }[]
  ) => {
    if (items.length === 0) return

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE)

      const values = batch.map((item) => ({
        objectType: item.objectType as any,
        refId: String(item.id),
        teamId: item.teamId as any,
        userId: item.userId || null,
        refUpdatedAt: timestamp
      }))

      const result = await pg
        .with('Insert', (qc) =>
          qc
            .insertInto('EmbeddingsMetadata')
            .values(values)
            .onConflict((oc) =>
              oc.columns(['objectType', 'refId']).doUpdateSet({
                refUpdatedAt: timestamp, // Force update timestamp
                // Update associations
                teamId: (eb) => eb.ref('excluded.teamId'),
                userId: (eb) => eb.ref('excluded.userId')
              })
            )
            .returning('id')
        )
        .with('Metadata', (qc) =>
          qc
            .selectFrom('Insert')
            .innerJoin(
              sql<{model: string}>`UNNEST(ARRAY[${sql.join(tableNames)}])`.as('model'),
              (join) => join.on('Insert.id', 'is not', null)
            )
            .select(['id', 'model'])
        )
        .insertInto('EmbeddingsJobQueue')
        .columns(['jobType', 'priority', 'embeddingsMetadataId', 'model', 'jobData'])
        .expression(({selectFrom}) =>
          selectFrom('Metadata').select(({ref}) => [
            sql.lit('embed:start').as('jobType'),
            priority.as('priority'),
            ref('Metadata.id').as('embeddingsMetadataId'),
            ref('Metadata.model').as('model'),
            sql.lit(JSON.stringify({forceBuildText: true})).as('jobData')
          ])
        )
        .execute()

      queuedCount += Number(result[0]?.numInsertedOrUpdatedRows || 0)
    }
  }

  // Process Pages
  await processBatch(
    pages.map((p) => ({
      id: String(p.id),
      teamId: p.teamId,
      userId: p.userId,
      objectType: 'page'
    }))
  )

  // Process Templates
  await processBatch(
    templates.map((t) => ({
      id: t.id,
      teamId: t.teamId,
      objectType: 'meetingTemplate'
    }))
  )

  // Process Discussions
  await processBatch(
    discussions.map((d) => ({
      id: d.id,
      teamId: d.teamId,
      objectType: 'retrospectiveDiscussionTopic'
    }))
  )

  return {
    success: true,
    queuedCount
  }
}

export default embedderReIndex
