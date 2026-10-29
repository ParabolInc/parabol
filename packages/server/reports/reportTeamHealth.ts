import {MIN_REPORT_HEALTH_RESPONDENTS} from '../../client/shared/reports/reportCatalog'
import {toTeamHealthDeviation} from '../../client/shared/reports/teamHealthAttention'
import {isTeamHealthHeatmapSpec} from '../../client/shared/reports/teamHealthReportSpec'
import {canShowRespondentDetails} from '../../client/shared/utils/teamHealthAnonymity'
import type {TeamHealthCheck} from '../dataloader/reportLoaderMakers'
import type {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import averageTeamHealthScore from '../utils/averageTeamHealthScore'
import getTeamHealthDisplayComment from '../utils/getTeamHealthDisplayComment'
import isTeamHealthSummaryLoading from '../utils/isTeamHealthSummaryLoading'
import {isInTeamHealthWindow, pickLatestCheckByCategory} from './measures/teamHealthAnswers'
import type {ReportResultSource} from './runReport'

// how many checks before a team's latest a cell looks back on, enough to tell a score that fell twice in a row
const EARLIER_CHECK_COUNT = 2
// how many checks back a cell searches for those, past checks that asked about other categories
const EARLIER_CHECK_SEARCH = 8

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
  const categories = new Map<
    number,
    {question: string; scores: number[]; comments: {text: string; authorId: string | null}[]}
  >()
  for (const response of responses) {
    const question = questionById.get(response.questionId)
    if (!question) continue
    const category = categories.get(question.categoryId) ?? {
      question: question.question,
      scores: [],
      comments: []
    }
    if (response.score !== null) category.scores.push(response.score)
    const text = getTeamHealthDisplayComment(response)
    if (text)
      category.comments.push({text, authorId: response.isAnonymous ? null : response.userId})
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

const scoredCategoryIdsOf = ({categories}: CheckCategories) =>
  [...categories].flatMap(([categoryId, {scores}]) => (scores.length > 0 ? [categoryId] : []))

// each check read once, however many cells look at it
const toCheckCategoriesReader = (dataLoader: DataLoaderWorker) => {
  const readings = new Map<string, Promise<CheckCategories>>()
  return (checkId: string) => {
    const reading = readings.get(checkId) ?? readCheckCategories(checkId, dataLoader)
    readings.set(checkId, reading)
    return reading
  }
}

// The checks before one that scored a category, newest first, so a check that asked about other things doesn't stand
// in for one that asked about this
const findEarlierChecks = async (
  checks: readonly TeamHealthCheck[],
  checkIdx: number,
  categoryId: number,
  readCategories: (checkId: string) => Promise<CheckCategories>
) => {
  const searched = checks.slice(checkIdx + 1, checkIdx + 1 + EARLIER_CHECK_SEARCH)
  const searchedCategories = await Promise.all(searched.map(({id}) => readCategories(id)))
  return searched
    .flatMap((check, idx) => {
      const categories = searchedCategories[idx]!
      return scoredCategoryIdsOf(categories).includes(categoryId) ? [{check, categories}] : []
    })
    .slice(0, EARLIER_CHECK_COUNT)
}

// What a Team Health heatmap marks its cells from: each team's latest check in the period of each category, the same
// checks its scores come from. It takes every team the viewer can report on, whatever the filters, so filtering never
// moves a mark
export const readReportTeamHealth = async (
  report: Pick<ReportResultSource, 'spec' | 'from' | 'to' | 'reportableTeamIds'>,
  dataLoader: DataLoaderWorker
) => {
  const {spec, from: windowStart, to: periodEnd, reportableTeamIds: teamIds} = report
  if (!isTeamHealthHeatmapSpec(spec)) return null
  const now = new Date()
  const readAt = periodEnd < now ? periodEnd : now
  const readCategories = toCheckCategoriesReader(dataLoader)
  const checksByTeam = await Promise.all(
    teamIds.map((teamId) => dataLoader.get('teamHealthChecksByTeamId').load(teamId))
  )
  const windowChecks = checksByTeam
    .flat()
    .filter((check) => isInTeamHealthWindow(check, readAt, windowStart))
  const categoriesByCheckId = new Map(
    await Promise.all(windowChecks.map(async ({id}) => [id, await readCategories(id)] as const))
  )
  // a team's checks come newest first, so its latest check is the first one gathered
  const picksByCheckId = new Map<
    string,
    {teamChecks: TeamHealthCheck[]; check: TeamHealthCheck; categoryIds: number[]}
  >()
  for (const teamChecks of checksByTeam) {
    const picks = pickLatestCheckByCategory(
      teamChecks,
      (check) => scoredCategoryIdsOf(categoriesByCheckId.get(check.id)!),
      readAt,
      windowStart
    )
    for (const {check, categoryId} of picks) {
      const pick = picksByCheckId.get(check.id) ?? {teamChecks, check, categoryIds: []}
      pick.categoryIds.push(categoryId)
      picksByCheckId.set(check.id, pick)
    }
  }
  const picks = [...picksByCheckId.values()]
  const [summariesByCheck, membersByCheck] = await Promise.all([
    Promise.all(
      picks.map(({check}) =>
        dataLoader.get('teamHealthCategorySummariesByMeetingId').load(check.id)
      )
    ),
    Promise.all(picks.map(({check}) => dataLoader.get('teamMembersByTeamId').load(check.teamId)))
  ])
  return {
    checks: await Promise.all(
      picks.map(async ({teamChecks, check, categoryIds}, idx) => {
        const {respondentCount, isHidden, categories} = categoriesByCheckId.get(check.id)!
        const summaries = summariesByCheck[idx]!
        const checkIdx = teamChecks.indexOf(check)
        return {
          meetingId: check.id,
          teamId: check.teamId,
          endedAt: check.endedAt,
          checkNumber: teamChecks.length - checkIdx,
          respondentCount,
          memberCount: membersByCheck[idx]!.length,
          categories: isHidden
            ? []
            : await Promise.all(
                categoryIds.map(async (categoryId) => {
                  const {scores, comments} = categories.get(categoryId)!
                  const summary = summaries.find((row) => row.categoryId === categoryId)
                  const earlierChecks = await findEarlierChecks(
                    teamChecks,
                    checkIdx,
                    categoryId,
                    readCategories
                  )
                  return {
                    categoryId: String(categoryId),
                    respondentCount: scores.length,
                    commenterCount: comments.length,
                    deviation: canShowRespondentDetails(scores.length)
                      ? toTeamHealthDeviation(scores)
                      : null,
                    sentimentScore: summary?.sentimentScore ?? null,
                    isLoadingSummary: !!summary && isTeamHealthSummaryLoading(summary),
                    previousScores: earlierChecks.map((earlier) =>
                      averageOf(earlier.categories, categoryId)
                    )
                  }
                })
              )
        }
      })
    )
  }
}

// One category of one check, for the report's side panel. Comments go longest first, so their order says nothing
// about who answered when, and only a signed comment carries its author
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
  const readCategories = toCheckCategoriesReader(dataLoader)
  const [check, earlierChecks, summaries] = await Promise.all([
    readCategories(meetingId),
    findEarlierChecks(checks, checkIdx, categoryId, readCategories),
    dataLoader.get('teamHealthCategorySummariesByMeetingId').load(meetingId)
  ])
  const category = check.categories.get(categoryId)
  if (check.isHidden || !category || category.scores.length === 0) return null
  const summary = summaries.find((row) => row.categoryId === categoryId)
  const comments = await Promise.all(
    [...category.comments]
      .sort((a, b) => b.text.length - a.text.length)
      .map(async ({text, authorId}) => ({
        text,
        author: authorId ? await dataLoader.get('users').loadNonNull(authorId) : null
      }))
  )
  return {
    question: category.question,
    summary: summary?.summary ?? null,
    spreadScores: canShowRespondentDetails(category.scores.length)
      ? [...category.scores].sort((a, b) => a - b)
      : null,
    comments,
    scoreHistory: [{check: checks[checkIdx]!, categories: check}, ...earlierChecks]
      .flatMap(({check: {endedAt}, categories}) => {
        const score = averageOf(categories, categoryId)
        return score === null ? [] : [{endedAt, score}]
      })
      .reverse()
  }
}
