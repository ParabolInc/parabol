import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const pruneFailedEmbeddingJobs: MutationResolvers['pruneFailedEmbeddingJobs'] = async (
  _source,
  {before}
) => {
  const pg = getKysely()
  // RESOLUTION
  const deletion = await pg
    .deleteFrom('EmbeddingsFailures')
    .where('EmbeddingsFailures.lastFailedAt', '<=', before)
    .executeTakeFirst()
  return Number(deletion?.numDeletedRows)
}

export default pruneFailedEmbeddingJobs
