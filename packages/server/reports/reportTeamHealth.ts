import {canShowTeamHealthScore} from '../../client/shared/utils/teamHealthAnonymity'
import type {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import type {TeamHealthResultStageSource} from '../graphql/public/types/TeamHealthResultStage'
import getPhase from '../utils/getPhase'
import {
  fromTeamHealthCategoryKey,
  isInTeamHealthWindow,
  loadCheckAnswers,
  pickLatestCheckByCategory,
  type TeamHealthCheckAnswers
} from './measures/teamHealthAnswers'
import type {ReportResultSource} from './runReport'

// A category shows when its check isn't hidden and enough people scored it
const isShownCategory = (answers: TeamHealthCheckAnswers, checkId: string, categoryId: number) => {
  const check = answers.get(checkId)
  return (
    !!check &&
    !check.isHidden &&
    canShowTeamHealthScore(check.scoresByCategoryId.get(categoryId)?.length ?? 0)
  )
}

// A check's result stages, as its meeting shows them, by the category each discusses
const readResultStagesByCategoryId = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  if (meeting.meetingType !== 'teamHealth') return new Map<number, TeamHealthResultStageSource>()
  const stages = getPhase(meeting.phases, 'TEAM_HEALTH_RESULT')?.stages ?? []
  const questions = (
    await dataLoader.get('teamHealthQuestions').loadMany(stages.map(({questionId}) => questionId))
  ).filter(isValid)
  const categoryIdByQuestionId = new Map(questions.map(({id, categoryId}) => [id, categoryId]))
  return new Map(
    stages.flatMap((stage): [number, TeamHealthResultStageSource][] => {
      const categoryId = categoryIdByQuestionId.get(stage.questionId)
      return categoryId === undefined
        ? []
        : [[categoryId, {...stage, meetingId, teamId: meeting.teamId}]]
    })
  )
}

// When the latest check of any of the teams revealed its results, or null when none of them has run one
export const readLatestTeamHealthCheckEndedAt = async (
  teamIds: string[],
  dataLoader: DataLoaderWorker
) => {
  const checksByTeam = await Promise.all(
    teamIds.map((teamId) => dataLoader.get('teamHealthChecksByTeamId').load(teamId))
  )
  const latestEndedAts = checksByTeam.flatMap(
    (teamChecks) => teamChecks[0]?.endedAt.getTime() ?? []
  )
  return latestEndedAts.length > 0 ? new Date(Math.max(...latestEndedAts)) : null
}

// What a Team Health heatmap marks its cells from: each team's latest check in the period of each category, the same
// checks its scores come from, with the result stage of each category enough people scored. It takes every team the
// viewer can report on, whatever the filters, so filtering never moves a mark
export const readReportTeamHealthChecks = async (
  report: Pick<ReportResultSource, 'from' | 'to' | 'reportableTeamIds'>,
  dataLoader: DataLoaderWorker
) => {
  const {from: windowStart, to: periodEnd, reportableTeamIds: teamIds} = report
  const now = new Date()
  const readAt = periodEnd < now ? periodEnd : now
  const checksByTeam = await Promise.all(
    teamIds.map((teamId) => dataLoader.get('teamHealthChecksByTeamId').load(teamId))
  )
  const windowChecks = checksByTeam
    .flat()
    .filter((check) => isInTeamHealthWindow(check, readAt, windowStart))
  const answers = await loadCheckAnswers(
    windowChecks.map(({id}) => id),
    dataLoader
  )
  // a team's checks come newest first, so its latest check is the first one gathered
  const picksByCheckId = new Map<
    string,
    {teamChecks: (typeof checksByTeam)[number]; checkId: string; categoryIds: number[]}
  >()
  for (const teamChecks of checksByTeam) {
    const picks = pickLatestCheckByCategory(
      teamChecks,
      (check) => [...(answers.get(check.id)?.scoresByCategoryId.keys() ?? [])],
      readAt,
      windowStart
    )
    for (const {check, categoryId} of picks) {
      const pick = picksByCheckId.get(check.id) ?? {teamChecks, checkId: check.id, categoryIds: []}
      pick.categoryIds.push(categoryId)
      picksByCheckId.set(check.id, pick)
    }
  }
  return Promise.all(
    [...picksByCheckId.values()].map(async ({teamChecks, checkId, categoryIds}) => {
      const checkIdx = teamChecks.findIndex(({id}) => id === checkId)
      const check = teamChecks[checkIdx]!
      const shownCategoryIds = categoryIds.filter((categoryId) =>
        isShownCategory(answers, checkId, categoryId)
      )
      const [members, stagesByCategoryId] = await Promise.all([
        dataLoader.get('teamMembersByTeamId').load(check.teamId),
        shownCategoryIds.length > 0
          ? readResultStagesByCategoryId(checkId, dataLoader)
          : new Map<number, TeamHealthResultStageSource>()
      ])
      return {
        meetingId: checkId,
        teamId: check.teamId,
        endedAt: check.endedAt,
        checkNumber: teamChecks.length - checkIdx,
        respondentCount: answers.get(checkId)?.respondentCount ?? 0,
        memberCount: members.length,
        stages: shownCategoryIds.flatMap((categoryId) => stagesByCategoryId.get(categoryId) ?? [])
      }
    })
  )
}

// One category's result stage of a check, for the report's side panel. Null when the check or category is hidden
export const readReportTeamHealthStage = async (
  meetingId: string,
  categoryKey: string,
  dataLoader: DataLoaderWorker
) => {
  const categoryId = fromTeamHealthCategoryKey(categoryKey)
  const answers = await loadCheckAnswers([meetingId], dataLoader)
  if (!isShownCategory(answers, meetingId, categoryId)) return null
  const stagesByCategoryId = await readResultStagesByCategoryId(meetingId, dataLoader)
  return stagesByCategoryId.get(categoryId) ?? null
}
