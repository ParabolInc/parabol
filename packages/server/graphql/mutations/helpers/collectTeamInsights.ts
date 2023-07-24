import ms from 'ms'
import {RValue} from 'rethinkdb-ts'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'

const TEAM_INSIGHTS_PERIOD = ms('90 days')

const collectTeamInsights = async (teamId: string) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const insightsPeriod = new Date(now.getTime() - TEAM_INSIGHTS_PERIOD)

  const meetingInsights = await r
    .table('NewMeeting')
    .getAll(teamId, {index: 'teamId'})
    .filter((row: RValue) => row('createdAt').gt(insightsPeriod))
    .pluck('endedAt', 'usedReactjis', 'meetingType', 'templateId')
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
    .filter(({count}) => count > 5)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  await pg
    .updateTable('Team')
    .set({
      insightsUpdatedAt: now,
      mostUsedEmojis: mostUsedEmojis.length >= 2 ? JSON.stringify(mostUsedEmojis) : null
    })
    .where('id', '=', teamId)
    .execute()
}

export default collectTeamInsights
