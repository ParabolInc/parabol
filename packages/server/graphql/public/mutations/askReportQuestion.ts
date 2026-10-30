import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import completeReportAskWithOpenAI from '../../../reports/completeReportAskWithOpenAI'
import getReportScope from '../../../reports/getReportScope'
import {toClientOrgStructureLevels} from '../../../reports/orgStructure'
import recordReportQuestion from '../../../reports/recordReportQuestion'
import {isTimeZone, toLocalDate} from '../../../reports/reportCalendar'
import requestReportSpec from '../../../reports/requestReportSpec'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import hasUsedMonthlyAIQuota from '../../../utils/hasUsedMonthlyAIQuota'
import logError from '../../../utils/logError'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {MutationResolvers} from '../resolverTypes'

const MAX_QUESTION_LENGTH = 500

const askReportQuestion: MutationResolvers['askReportQuestion'] = async (
  _source,
  {orgId, question, timeZone},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const viewerIsSuperUser = isSuperUser(authToken)
  const trimmedQuestion = question.trim()

  // VALIDATION
  if (trimmedQuestion.length < 3 || trimmedQuestion.length > MAX_QUESTION_LENGTH) {
    throw new GraphQLError(`A question is 3 to ${MAX_QUESTION_LENGTH} characters`)
  }
  if (!isTimeZone(timeZone)) throw new GraphQLError(`${timeZone} isn't a time zone`)
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  if (!organization.useAI) {
    throw new GraphQLError(
      `AI is turned off for ${organization.name}. It can be turned on in Organization Settings`
    )
  }
  const {openAIApi} = new OpenAIServerManager()
  if (!openAIApi) throw new GraphQLError('AI isn’t set up on this Parabol server')
  if (!viewerIsSuperUser && (await hasUsedMonthlyAIQuota(viewerId))) {
    throw new GraphQLError('You have used this month’s AI requests')
  }

  // RESOLUTION
  const [{teams}, {levels}] = await Promise.all([
    getReportScope({orgId, viewerId, isSuperUser: viewerIsSuperUser, dataLoader}),
    dataLoader.get('orgStructureByOrgId').load(orgId)
  ])
  const answer = await requestReportSpec({
    question: trimmedQuestion,
    teams,
    levels: toClientOrgStructureLevels(levels),
    today: toLocalDate(new Date(), timeZone),
    timeZone,
    complete: completeReportAskWithOpenAI(openAIApi)
  }).catch((error) => {
    logError(error instanceof Error ? error : new Error('AI failed to answer a report question'))
    throw new GraphQLError('AI couldn’t answer just now. Try again in a moment')
  })
  await getKysely()
    .insertInto('AIRequest')
    .values({userId: viewerId, tokenCost: answer.tokenCost})
    .execute()
  if (answer.spec) {
    const reportQuestion = await recordReportQuestion({
      userId: viewerId,
      orgId,
      source: 'ask',
      question: trimmedQuestion,
      title: answer.title,
      aiSpec: answer.aiSpec,
      spec: answer.spec
    })
    return {reportQuestion, reason: null}
  }
  const reportQuestion = await recordReportQuestion({
    userId: viewerId,
    orgId,
    source: 'ask',
    question: trimmedQuestion,
    title: trimmedQuestion,
    aiSpec: answer.aiSpec,
    spec: null
  })
  return {reportQuestion, reason: answer.reason}
}

export default askReportQuestion
