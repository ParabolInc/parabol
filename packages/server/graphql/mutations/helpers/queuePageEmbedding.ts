import {sql} from 'kysely'
import getModelManager from '../../../../embedder/ai_models/ModelManager'
import {getEmbedderPriority} from '../../../../embedder/getEmbedderPriority'
import getKysely from '../../../postgres/getKysely'

export const queuePageEmbedding = async (
  pageId: number,
  teamId: string | null,
  userId?: string
) => {
  const pg = getKysely()

  let finalTeamId = teamId
  let finalUserId = userId

  if (!finalTeamId || !finalUserId) {
    const page = await pg
      .selectFrom('Page')
      .select(['teamId', 'userId'])
      .where('id', '=', pageId)
      .executeTakeFirst()
    if (page) {
      finalTeamId = finalTeamId ?? page.teamId
      finalUserId = finalUserId ?? page.userId
    } else {
      return
    }
  }

  let hasFeatureFlag = false

  if (finalTeamId) {
    // Case a: Team Page
    const result = await pg
      .selectFrom('Team as t')
      .innerJoin('FeatureFlagOwner as ffo', 'ffo.orgId', 't.orgId')
      .innerJoin('FeatureFlag as ff', 'ff.id', 'ffo.featureFlagId')
      .where('t.id', '=', finalTeamId)
      .where('ff.featureName', '=', 'search')
      .where('ff.expiresAt', '>', new Date())
      .select('ff.id')
      .executeTakeFirst()
    hasFeatureFlag = !!result
  } else if (finalUserId) {
    // Case b: Private/Shared Page
    const result = await pg
      .selectFrom('OrganizationUser as ou')
      .innerJoin('FeatureFlagOwner as ffo', 'ffo.orgId', 'ou.orgId')
      .innerJoin('FeatureFlag as ff', 'ff.id', 'ffo.featureFlagId')
      .where('ou.userId', '=', finalUserId)
      .where('ff.featureName', '=', 'search')
      .where('ff.expiresAt', '>', new Date())
      .select('ff.id')
      .executeTakeFirst()
    hasFeatureFlag = !!result
  }

  if (!hasFeatureFlag) {
    return
  }

  const modelManager = getModelManager()
  const tableNames = [...modelManager.embeddingModels.keys()]
  const priority = getEmbedderPriority(1)

  await pg
    .with('Insert', (qc) =>
      qc
        .insertInto('EmbeddingsMetadata')
        .values({
          objectType: 'page' as any,
          refId: String(pageId),
          teamId: finalTeamId as any, // can be null now
          userId: finalUserId as any,
          refUpdatedAt: new Date()
        })
        .onConflict((oc) =>
          oc.columns(['objectType', 'refId']).doUpdateSet({
            // Update associations if they changed (e.g. moved to team)
            teamId: finalTeamId as any,
            userId: finalUserId as any
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
    .columns(['jobType', 'priority', 'embeddingsMetadataId', 'model'])
    .expression(({selectFrom}) =>
      selectFrom('Metadata').select(({ref}) => [
        sql.lit('embed:start').as('jobType'),
        priority.as('priority'),
        ref('Metadata.id').as('embeddingsMetadataId'),
        ref('Metadata.model').as('model')
      ])
    )
    .execute()
}
