import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import isValid from '../../isValid'
import type {MutationResolvers} from '../resolverTypes'

const addTeamHealthTemplateQuestion: MutationResolvers['addTeamHealthTemplateQuestion'] = async (
  _source,
  {templateId, questionIds: clientQuestionIds},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  if (!template || template.type !== 'teamHealth') {
    throw new GraphQLError('Template not found')
  }

  // VALIDATION
  if (clientQuestionIds.length === 0) {
    throw new GraphQLError('No questions provided')
  }
  const questionIds = clientQuestionIds.map((id) => CipherId.fromClient(id)[0])
  const questions = (await dataLoader.get('teamHealthQuestions').loadMany(questionIds)).filter(
    isValid
  )
  const validIds = questions.filter((q) => !q.replacedBy).map((q) => q.id)
  if (validIds.length === 0) {
    throw new GraphQLError('No valid questions provided')
  }

  // RESOLUTION
  await pg
    .insertInto('TeamHealthTemplateQuestion')
    .values(validIds.map((questionId) => ({templateId, questionId})))
    .onConflict((oc) => oc.doNothing())
    .execute()
  dataLoader.get('teamHealthTemplateQuestionsByTemplateId').clear(templateId)

  const data = {
    templateId
  }
  publish(
    SubscriptionChannel.TEAM,
    template.teamId,
    'AddTeamHealthTemplateQuestionSuccess',
    data,
    subOptions
  )
  return data
}

export default addTeamHealthTemplateQuestion
