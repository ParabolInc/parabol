import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import {getSummaries} from './helpers/getSummaries'
import {getTopics} from './helpers/getTopics'

const generateInsight: MutationResolvers['generateInsight'] = async (
  _source,
  {teamId, startDate, endDate, useSummaries = true},
  {dataLoader}
) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return standardError(
      new Error('Invalid date format. Please use ISO 8601 format (e.g., 2024-01-01T00:00:00Z).')
    )
  }
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000
  if (end.getTime() - start.getTime() < oneWeekInMs) {
    return standardError(new Error('The end date must be at least one week after the start date.'))
  }

  const response = useSummaries
    ? await getSummaries(teamId, startDate, endDate, dataLoader)
    : await getTopics(teamId, startDate, endDate, dataLoader)

  if ('error' in response) {
    return response
  }
  const {wins, challenges} = response
  const pg = getKysely()
  await pg
    .insertInto('Insight')
    .values({
      teamId,
      wins,
      challenges,
      startDate,
      endDate
    })
    .execute()

  return response
}

export default generateInsight
