import {GraphQLError} from 'graphql'
import {activeEmbeddingModelId, embeddingModelIds} from '../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsRun, setEmbeddingsRun} from '../../../../embedder/embeddingsRun'
import {getEmbeddingsRunProgress} from '../../../../embedder/feedEmbeddingsRun'
import getKysely from '../../../postgres/getKysely'
import isValid from '../../isValid'
import {publishToEmbedder} from '../../mutations/helpers/publishToEmbedder'
import type {MutationResolvers} from '../resolverTypes'

const DEFAULT_RUN_QUEUE_SIZE = 100

const buildEmbeddings: MutationResolvers['buildEmbeddings'] = async (
  _source,
  {input},
  {dataLoader}
) => {
  const pg = getKysely()
  const {adhoc, lastFailedAt, run} = input
  if (run) {
    const {modelId, action, copyMetadata, queueSize} = run
    const targetModelId = embeddingModelIds.find(
      (id) => id === modelId && id !== activeEmbeddingModelId
    )
    if (!targetModelId || !activeEmbeddingModelId) {
      throw new GraphQLError(
        'modelId must be a configured embedding generation other than the active one'
      )
    }
    if (action === 'start') {
      const size = queueSize ?? DEFAULT_RUN_QUEUE_SIZE
      if (size < 1) throw new GraphQLError('queueSize must be at least 1')
      await setEmbeddingsRun({
        modelId: targetModelId,
        state: 'running',
        copyMetadata: !!copyMetadata,
        queueSize: size
      })
    } else if (action !== 'status') {
      const current = await getEmbeddingsRun()
      if (current?.modelId !== targetModelId) {
        throw new GraphQLError(`There is no run for ${modelId} to ${action}`)
      }
      await setEmbeddingsRun({...current, state: action === 'pause' ? 'paused' : 'running'})
    }
    const {recentPages, olderPages} = await getEmbeddingsRunProgress(
      targetModelId,
      activeEmbeddingModelId
    )
    return recentPages.total - recentPages.done + olderPages.total - olderPages.done
  }
  if (lastFailedAt) {
    const {startAt, endAt} = lastFailedAt
    // This is the inverse of WorkflowOrchestrator.failJob
    const res = await pg
      .with('deletedJob', (qc) =>
        qc
          .deleteFrom('EmbeddingsFailures')
          .where('lastFailedAt', '>=', startAt)
          .where('lastFailedAt', '<', endAt)
          .returningAll()
      )
      .insertInto('EmbeddingsJobQueueV2')
      .columns(['embeddingsMetadataId', 'modelId', 'retryCount', 'jobData', 'jobType', 'pageId'])
      .expression(({selectFrom}) =>
        selectFrom('deletedJob').select(({ref}) => [
          ref('deletedJob.embeddingsMetadataId').as('embeddingsMetadataId'),
          ref('deletedJob.modelId').as('modelId'),
          ref('deletedJob.retryCount').as('retryCount'),
          ref('deletedJob.jobData').as('jobData'),
          ref('deletedJob.jobType').as('jobType'),
          ref('deletedJob.pageId').as('pageId')
        ])
      )
      .executeTakeFirst()
    return Number(res.numInsertedOrUpdatedRows)
  }
  if (adhoc) {
    const {startAt, endAt, type, orgIds} = adhoc
    if (type === 'page') {
      const userIds = await (async () => {
        if (!orgIds) return null
        const orgUsers = await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds)
        return [
          ...new Set(
            orgUsers
              .filter(isValid)
              .flat()
              .map((ou) => ou.userId)
          )
        ]
      })()
      const filterUserIds = userIds && userIds.length > 0

      const pages = await pg
        .selectFrom('Page')
        .select('id')
        .where('updatedAt', '>=', startAt)
        .where('updatedAt', '<', endAt)
        .$if(!!filterUserIds, (qb) => qb.innerJoin('PageAccess', 'PageAccess.pageId', `Page.id`))
        .execute()
      await Promise.all(
        pages.map(({id: pageId}) => {
          publishToEmbedder({jobType: 'embedPage:start', pageId})
        })
      )
      return pages.length
    } else {
      throw new GraphQLError(`Type: ${type} not implemented yet`)
    }
  }
  return 0
}

export default buildEmbeddings
