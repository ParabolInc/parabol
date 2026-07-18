import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeTeamHealthTemplateQuestion: MutationResolvers['removeTeamHealthTemplateQuestion'] =
  async (
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

    // RESOLUTION
    await pg
      .deleteFrom('TeamHealthTemplateQuestion')
      .where('templateId', '=', templateId)
      .where('questionId', 'in', questionIds)
      .execute()
    dataLoader.get('teamHealthTemplateQuestionsByTemplateId').clear(templateId)

    // echo the raw ids back on the payload; the payload type ciphers them
    const data = {templateId, questionIds}
    publish(
      SubscriptionChannel.TEAM,
      template.teamId,
      'RemoveTeamHealthTemplateQuestionSuccess',
      data,
      subOptions
    )
    return data
  }

export default removeTeamHealthTemplateQuestion
