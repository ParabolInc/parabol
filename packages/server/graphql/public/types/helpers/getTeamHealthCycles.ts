import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import {
  getTeamHealthCategoryScores,
  type TeamHealthCategoryScoreSource
} from './getTeamHealthCategoryScores'

export interface TeamHealthCycle {
  meetingId: string
  name: string
  endedAt: Date
  respondentCount: number
  categoryScores: TeamHealthCategoryScoreSource[]
}

// Every completed Team Health cycle the team has run, oldest first, each rolled up by category and
// diffed against the cycle before it. "The cycle before" is scoped to the team rather than to the
// meeting series: a lead who runs an ad-hoc cycle between scheduled ones still means "last time we
// asked" when they read a delta.
export const getTeamHealthCycles = async (
  teamId: string,
  dataLoader: DataLoaderInstance
): Promise<TeamHealthCycle[]> => {
  const completedMeetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
  const healthMeetings = completedMeetings
    .filter((meeting) => meeting.meetingType === 'teamHealth' && !!meeting.endedAt)
    // the loader hands back newest first; a trend reads oldest first
    .sort((a, b) => a.endedAt!.getTime() - b.endedAt!.getTime())
  const meetingIds = healthMeetings.map(({id}) => id)
  const [categoryScoresByMeeting, responsesByMeeting] = await Promise.all([
    getTeamHealthCategoryScores(meetingIds, dataLoader),
    Promise.all(
      meetingIds.map((meetingId) =>
        dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
      )
    )
  ])

  // walking forward, each cycle's delta is measured against the last cycle that scored that
  // category, so a category skipped by rotation doesn't reset its own history
  const lastScoreByCategoryId = new Map<number, number>()
  return healthMeetings.map((meeting, idx) => {
    const categoryScores = (categoryScoresByMeeting[idx] ?? []).map((categoryScore) => {
      const previous = lastScoreByCategoryId.get(categoryScore.categoryId)
      return {
        ...categoryScore,
        meanScoreDelta: previous === undefined ? null : categoryScore.meanScore - previous
      }
    })
    categoryScores.forEach(({categoryId, meanScore}) => {
      lastScoreByCategoryId.set(categoryId, meanScore)
    })
    return {
      meetingId: meeting.id,
      name: meeting.name,
      endedAt: meeting.endedAt!,
      respondentCount: new Set(responsesByMeeting[idx]!.map(({userId}) => userId)).size,
      categoryScores
    }
  })
}
