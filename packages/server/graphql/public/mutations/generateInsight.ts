import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import {getSummaries} from './helpers/getSummaries'
import {getTopics} from './helpers/getTopics'

const generateInsight: MutationResolvers['generateInsight'] = async (
  _source,
  {teamId, startDate, endDate, useSummaries = true, prompt},
  {dataLoader}
) => {
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return standardError(
      new Error('Invalid date format. Please use ISO 8601 format (e.g., 2024-01-01T00:00:00Z).')
    )
  }
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000
  if (endDate.getTime() - startDate.getTime() < oneWeekInMs) {
    return standardError(new Error('The end date must be at least one week after the start date.'))
  }

  const response = useSummaries
    ? await getSummaries(teamId, startDate, endDate, prompt)
    : await getTopics(teamId, startDate, endDate, dataLoader, prompt)

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
      startDateTime: startDate,
      endDateTime: endDate
    })
    .execute()

  return response
}

export default generateInsight
