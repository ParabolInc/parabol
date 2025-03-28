import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import {getSummaries} from './helpers/getSummaries'
import {getTopics} from './helpers/getTopics'

const generateInsight: MutationResolvers['generateInsight'] = async (
  _source,
  {teamId, startDate, endDate, useSummaries = true, prompt},
  context
) => {
  const {dataLoader, socketId: mutatorId, authToken} = context
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  const hasInsightsFlag = await dataLoader
    .get('featureFlagByOwnerId')
    .load({ownerId: teamId, featureName: 'insights'})
  if (!hasInsightsFlag) {
    return standardError(new Error('Insights are not enabled for this team'), {userId: viewerId})
  }

  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
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
    ? await getSummaries(teamId, startDate, endDate, dataLoader, prompt)
    : await getTopics(teamId, startDate, endDate, dataLoader, prompt)

  if ('error' in response) {
    return response
  }
  const {wins, challenges, meetingIds} = response
  const pg = getKysely()

  const [insertedInsight] = await pg
    .insertInto('Insight')
    .values({
      teamId,
      wins,
      challenges,
      meetingsCount: meetingIds.length,
      startDateTime: startDate,
      endDateTime: endDate
    })
    .returning(['id'])
    .execute()

  if (!insertedInsight) {
    return standardError(new Error('Failed to insert insight'))
  }
  const data = {
    teamId
  }

  publish(SubscriptionChannel.TEAM, teamId, 'GenerateInsightSuccess', data, subOptions)
  analytics.insightGenerated(viewer, insertedInsight.id, teamId)
  return data
}

export default generateInsight
