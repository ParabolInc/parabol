import ms from 'ms'
import {RValue} from 'rethinkdb-ts'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {DataLoaderWorker} from '../../graphql'

const TEAM_INSIGHTS_PERIOD = ms('90 days')
const MAX_NUMBER_OF_USED_EMOJIS = 3
const MIN_NUMBER_OF_USED_EMOJIS = 2
const MIN_EMOJI_COUNT = 5

const updateTeamInsights = async (teamId: string, dataLoader: DataLoaderWorker) => {
  // check feature flag
  // team is loaded anyways by the callers, so no harm in loading it here again for a more concise argument list
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {orgId} = team
  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization?.featureFlags?.includes('teamInsights')) return

  // actual update
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const insightsPeriod = new Date(now.getTime() - TEAM_INSIGHTS_PERIOD)

  const meetingInsights = await r
    .table('NewMeeting')
    .getAll(teamId, {index: 'teamId'})
    .filter((row: RValue) => row('createdAt').gt(insightsPeriod))
    .pluck('endedAt', 'usedReactjis', 'meetingType', 'templateId', 'engagement')
    .run()

  const allUsedEmojis = meetingInsights.reduce((acc, meeting) => {
    if (!meeting?.usedReactjis) return acc
    Object.entries(meeting?.usedReactjis).forEach(([emoji, count]) => {
      acc[emoji] = (acc[emoji] ?? 0) + count
    })
    return acc
  }, {} as Record<string, number>)

  const mostUsedEmojis = Object.entries(allUsedEmojis)
    .map(([id, count]) => ({id, count}))
    .filter(({count}) => count >= MIN_EMOJI_COUNT)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_NUMBER_OF_USED_EMOJIS)

  const engagement = meetingInsights.reduce(
    (acc, meeting) => {
      if (!meeting || !meeting.engagement || !meeting.meetingType) return acc
      const eng = acc[meeting.meetingType] ?? {
        engagementSum: 0,
        count: 0
      }
      eng.engagementSum += meeting.engagement
      eng.count += 1
      acc.all!.engagementSum += meeting.engagement
      acc.all!.count += 1
      acc[meeting.meetingType] = eng
      return acc
    },
    {all: {engagementSum: 0, count: 0}} as Record<string, {engagementSum: number; count: number}>
  )

  const meetingEngagement = Object.fromEntries(
    Object.entries(engagement).map(([key, value]) => [key, value.engagementSum / value.count])
  )

  await pg
    .updateTable('Team')
    .set({
      insightsUpdatedAt: now,
      mostUsedEmojis:
        mostUsedEmojis.length >= MIN_NUMBER_OF_USED_EMOJIS ? JSON.stringify(mostUsedEmojis) : null,
      meetingEngagement: meetingEngagement.all ? JSON.stringify(meetingEngagement) : null
    })
    .where('id', '=', teamId)
    .execute()
}

export default updateTeamInsights
