import {MIN_RESPONDENTS_FOR_SUMMARY} from '../../../../client/shared/utils/teamHealthAnonymity'
import getKysely from '../../../postgres/getKysely'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import getPhase from '../../../utils/getPhase'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAI from './canAccessAI'

/**
 * Records which categories of a check being revealed will get an AI summary, as rows with nothing
 * written yet, so the reveal publishes each of them as loading. Run before the reveal is published
 * and never calls the model: summarizeTeamHealthCategories writes the rows afterward.
 */
const queueTeamHealthCategorySummaries = async (
  meeting: TeamHealthMeeting,
  dataLoader: DataLoaderWorker
) => {
  const {id: meetingId, teamId, phases} = meeting
  if (!process.env.OPEN_AI_API_KEY) return
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader))) return
  const resultStages = getPhase(phases, 'TEAM_HEALTH_RESULT').stages
  const [responses, questions] = await Promise.all([
    dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId),
    dataLoader.get('teamHealthQuestions').loadMany(resultStages.map(({questionId}) => questionId))
  ])
  const categoryIds = questions.filter(isValid).flatMap(({id: questionId, categoryId}) => {
    const respondentCount = responses.filter(
      (response) => response.questionId === questionId && response.score !== null
    ).length
    return respondentCount >= MIN_RESPONDENTS_FOR_SUMMARY ? [categoryId] : []
  })
  if (categoryIds.length === 0) return
  await getKysely()
    .insertInto('TeamHealthCategorySummary')
    .values(categoryIds.map((categoryId) => ({meetingId, categoryId})))
    .onConflict((oc) => oc.columns(['meetingId', 'categoryId']).doNothing())
    .execute()
  dataLoader.get('teamHealthCategorySummariesByMeetingId').clear(meetingId)
}

export default queueTeamHealthCategorySummaries
