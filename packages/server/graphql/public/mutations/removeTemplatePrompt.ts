import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeTemplatePrompt: MutationResolvers['removeTemplatePrompt'] = async (
  _source,
  {promptId},
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
  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
  const activePrompts = prompts.filter((p) => !p.removedAt)

  if (activePrompts.length <= 1) {
    throw new GraphQLError('No prompts remain')
  }

  await pg
    .updateTable('ReflectPrompt')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', promptId)
    .execute()
  dataLoader.clearAll('reflectPrompts')
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveTemplatePromptSuccess', data, subOptions)
  return data
}

export default removeTemplatePrompt
