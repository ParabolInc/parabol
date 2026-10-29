import {MIN_REPORT_HEALTH_RESPONDENTS} from '../../client/shared/reports/reportCatalog'
import {toTeamHealthDeviation} from '../../client/shared/reports/teamHealthAttention'
import {isTeamHealthHeatmapSpec} from '../../client/shared/reports/teamHealthReportSpec'
import {canShowRespondentDetails} from '../../client/shared/utils/teamHealthAnonymity'
import type {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import averageTeamHealthScore from '../utils/averageTeamHealthScore'
import getTeamHealthDisplayComment from '../utils/getTeamHealthDisplayComment'
import isTeamHealthSummaryLoading from '../utils/isTeamHealthSummaryLoading'
import {findLatestTeamHealthCheck} from './measures/teamHealthAnswers'
import type {ReportResultSource} from './runReport'

// how many checks before a team's latest a cell looks back on, enough to tell a score that fell twice in a row
const EARLIER_CHECK_COUNT = 2

// A check's scores and the comments anyone may read, by category. Too few people answering hides the whole check
const readCheckCategories = async (checkId: string, dataLoader: DataLoaderWorker) => {
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(checkId)
  const questionIds = [...new Set(responses.map(({questionId}) => questionId))]
  const questions = (await dataLoader.get('teamHealthQuestions').loadMany(questionIds)).filter(
    isValid
  )
  const questionById = new Map(questions.map((question) => [question.id, question]))
  const respondentIds = new Set(
    responses.flatMap(({userId, score}) => (score === null ? [] : [userId]))
  )
  const categories = new Map<number, {question: string; scores: number[]; comments: string[]}>()
  for (const response of responses) {
    const question = questionById.get(response.questionId)
    if (!question) continue
    const category = categories.get(question.categoryId) ?? {
      question: question.question,
      scores: [],
      comments: []
    }
    if (response.score !== null) category.scores.push(response.score)
    const comment = getTeamHealthDisplayComment(response)
    if (comment) category.comments.push(comment)
    categories.set(question.categoryId, category)
  }
  return {
    respondentCount: respondentIds.size,
    isHidden: respondentIds.size < MIN_REPORT_HEALTH_RESPONDENTS,
    categories
  }
}

type CheckCategories = Awaited<ReturnType<typeof readCheckCategories>>

const averageOf = (check: CheckCategories, categoryId: number) =>
  check.isHidden ? null : averageTeamHealthScore(check.categories.get(categoryId)?.scores ?? [])

// What a Team Health heatmap marks its cells from: each team's latest check in the period. It takes every team the
// viewer can report on, whatever the filters, so filtering never moves a mark
export const readReportTeamHealth = async (
  report: Pick<ReportResultSource, 'spec' | 'from' | 'to' | 'reportableTeamIds'>,
  dataLoader: DataLoaderWorker
) => {
  const {spec, from: windowStart, to: periodEnd, reportableTeamIds: teamIds} = report
  if (!isTeamHealthHeatmapSpec(spec)) return null
  const now = new Date()
  const readAt = periodEnd < now ? periodEnd : now
  const checksByTeam = await Promise.all(
    teamIds.map((teamId) => dataLoader.get('teamHealthChecksByTeamId').load(teamId))
  )
  const picks = teamIds.flatMap((teamId, idx) => {
    const checks = checksByTeam[idx]!
    const latestIdx = findLatestTeamHealthCheck(checks, readAt, windowStart)
    if (latestIdx === -1) return []
    return [
      {
        teamId,
        check: checks[latestIdx]!,
        checkNumber: checks.length - latestIdx,
        earlierCheckIds: checks
          .slice(latestIdx + 1, latestIdx + 1 + EARLIER_CHECK_COUNT)
          .map(({id}) => id)
      }
    ]
  })
  const checkIds = [
    ...new Set(picks.flatMap(({check, earlierCheckIds}) => [check.id, ...earlierCheckIds]))
  ]
  const [checkCategories, summariesByCheck, membersByTeam] = await Promise.all([
    Promise.all(checkIds.map((checkId) => readCheckCategories(checkId, dataLoader))),
    Promise.all(
      picks.map(({check}) =>
        dataLoader.get('teamHealthCategorySummariesByMeetingId').load(check.id)
      )
    ),
    Promise.all(picks.map(({teamId}) => dataLoader.get('teamMembersByTeamId').load(teamId)))
  ])
  const categoriesByCheckId = new Map(
    checkIds.map((checkId, idx) => [checkId, checkCategories[idx]!])
  )
  return {
    checks: picks.map(({teamId, check, checkNumber, earlierCheckIds}, idx) => {
      const {respondentCount, isHidden, categories} = categoriesByCheckId.get(check.id)!
      const summaries = summariesByCheck[idx]!
      return {
        meetingId: check.id,
        teamId,
        endedAt: check.endedAt,
        checkNumber,
        respondentCount,
        memberCount: membersByTeam[idx]!.length,
        categories: isHidden
          ? []
          : [...categories].flatMap(([categoryId, {scores, comments}]) => {
              if (scores.length === 0) return []
              const summary = summaries.find((row) => row.categoryId === categoryId)
              return [
                {
                  categoryId: String(categoryId),
                  respondentCount: scores.length,
                  commenterCount: comments.length,
                  deviation: canShowRespondentDetails(scores.length)
                    ? toTeamHealthDeviation(scores)
                    : null,
                  sentimentScore: summary?.sentimentScore ?? null,
                  isLoadingSummary: !!summary && isTeamHealthSummaryLoading(summary),
                  previousScores: earlierCheckIds.map((checkId) =>
                    averageOf(categoriesByCheckId.get(checkId)!, categoryId)
                  )
                }
              ]
            })
      }
    })
  }
}

// One category of one check, for the report's side panel. Comments go longest first, so their order says nothing
// about who answered when
export const readReportTeamHealthCell = async (
  meetingId: string,
  categoryKey: string,
  dataLoader: DataLoaderWorker
) => {
  const categoryId = Number(categoryKey)
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const checks = await dataLoader.get('teamHealthChecksByTeamId').load(meeting.teamId)
  const checkIdx = checks.findIndex(({id}) => id === meetingId)
  if (checkIdx === -1) return null
  const recentChecks = checks.slice(checkIdx, checkIdx + 1 + EARLIER_CHECK_COUNT)
  const [recentCategories, summaries] = await Promise.all([
    Promise.all(recentChecks.map(({id}) => readCheckCategories(id, dataLoader))),
    dataLoader.get('teamHealthCategorySummariesByMeetingId').load(meetingId)
  ])
  const check = recentCategories[0]!
  const category = check.categories.get(categoryId)
  if (check.isHidden || !category || category.scores.length === 0) return null
  const summary = summaries.find((row) => row.categoryId === categoryId)
  return {
    question: category.question,
    summary: summary?.summary ?? null,
    spreadScores: canShowRespondentDetails(category.scores.length)
      ? [...category.scores].sort((a, b) => a - b)
      : null,
    comments: [...category.comments].sort((a, b) => b.length - a.length),
    scoreHistory: recentChecks
      .flatMap(({endedAt}, idx) => {
        const score = averageOf(recentCategories[idx]!, categoryId)
        return score === null ? [] : [{endedAt, score}]
      })
      .reverse()
  }
}
