import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const prunePG: MutationResolvers['prunePG'] = async (_source, {before}) => {
  const pg = getKysely()
  const deletions = await Promise.all([
    pg
      .deleteFrom('EmbeddingsFailures')
      .where('EmbeddingsFailures.lastFailedAt', '<=', before)
      .executeTakeFirst(),
    pg.deleteFrom('OAuthAPICode').where('expiresAt', '<', sql<Date>`now()`).executeTakeFirst(),
    pg
      .deleteFrom('OAuthAPIRefreshToken')
      .where('expiresAt', '<', sql<Date>`now()`)
      .executeTakeFirst()
  ])
  return deletions.reduce((total, {numDeletedRows}) => total + Number(numDeletedRows), 0)
}

export default prunePG
