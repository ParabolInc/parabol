import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
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
  const prompt = await dataLoader.get('reflectPrompts').load(promptId)

  if (!prompt || prompt.removedAt) {
    throw new GraphQLError('Prompt not found')
  }
  const {teamId, templateId} = prompt
  const trimmedQuestion = question.trim().slice(0, 100)
  const normalizedQuestion = trimmedQuestion || 'Unnamed Prompt'

  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
  const activePrompts = prompts.filter(({removedAt}) => !removedAt)
  if (activePrompts.find((prompt) => prompt.question === normalizedQuestion)) {
    throw new GraphQLError('Duplicate question template')
  }

  await pg
    .updateTable('ReflectPrompt')
    .set({question: normalizedQuestion})
    .where('id', '=', promptId)
    .execute()
  dataLoader.clearAll('reflectPrompts')
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenameTemplatePromptSuccess', data, subOptions)
  return data
}

export default renameTemplatePrompt
