import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const renameTemplatePrompt: MutationResolvers['renameTemplatePrompt'] = async (
  _source,
  {promptId, question},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const prompt = await dataLoader.get('templatePrompts').load(promptId)

  if (!prompt || prompt.removedAt) {
    throw new GraphQLError('Prompt not found')
  }
  const {teamId, templateId} = prompt
  const trimmedQuestion = question.trim().slice(0, 100)
  const normalizedQuestion = trimmedQuestion || 'Unnamed Prompt'

  const activePrompts = await dataLoader.get('templatePromptsByTemplateId').load(templateId)
  if (activePrompts.find((prompt) => prompt.question === normalizedQuestion)) {
    throw new GraphQLError('Duplicate question template')
  }

  const [standupResponse, retroReflection] = await Promise.all([
    pg
      .selectFrom('TeamPromptResponse')
      .select('id')
      .where('promptId', '=', promptId)
      .limit(1)
      .executeTakeFirst(),
    pg
      .selectFrom('RetroReflection')
      .select('id')
      .where('promptId', '=', promptId)
      .limit(1)
      .executeTakeFirst()
  ])
  const isAnswered = Boolean(standupResponse || retroReflection)

  const renamedPromptId = isAnswered ? generateUID() : promptId
  if (isAnswered) {
    const now = new Date()
    await pg.transaction().execute(async (trx) => {
      await trx
        .updateTable('TemplatePrompt')
        .set({removedAt: now})
        .where('id', '=', promptId)
        .execute()
      await trx
        .insertInto('TemplatePrompt')
        .values({
          id: renamedPromptId,
          templateId,
          teamId,
          sortOrder: prompt.sortOrder,
          question: normalizedQuestion,
          description: prompt.description,
          groupColor: prompt.groupColor,
          createdAt: now,
          removedAt: null
        })
        .execute()
    })
  } else {
    await pg
      .updateTable('TemplatePrompt')
      .set({question: normalizedQuestion})
      .where('id', '=', promptId)
      .execute()
  }
  dataLoader.clearAll('templatePrompts')
  const data = {promptId: renamedPromptId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenameTemplatePromptSuccess', data, subOptions)
  return data
}

export default renameTemplatePrompt
