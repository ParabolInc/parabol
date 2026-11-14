import {sql} from 'kysely'
import {USER_AI_TOKENS_MONTHLY_LIMIT} from '../postgres/constants'
import getKysely from '../postgres/getKysely'

const hasUsedMonthlyAIQuota = async (userId: string) => {
  const pg = getKysely()
  const {tokenUsage} = await pg
    .selectFrom('AIRequest')
    .select(pg.fn.coalesce(pg.fn.sum<bigint>('tokenCost'), sql`0`).as('tokenUsage'))
    .where('userId', '=', userId)
    .where('createdAt', '>=', sql<Date>`NOW() - INTERVAL '30 days'`)
    .executeTakeFirstOrThrow()
  return Number(tokenUsage) >= USER_AI_TOKENS_MONTHLY_LIMIT
}

export default hasUsedMonthlyAIQuota
