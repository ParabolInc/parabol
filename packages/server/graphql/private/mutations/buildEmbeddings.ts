import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import isValid from '../../isValid'
import {publishToEmbedder} from '../../mutations/helpers/publishToEmbedder'
import type {MutationResolvers} from '../resolverTypes'

const buildEmbeddings: MutationResolvers['buildEmbeddings'] = async (
  _source,
  {input},
  {dataLoader}
) => {
  const pg = getKysely()
  const {adhoc, lastFailedAt} = input
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
