import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const moveTemplatePrompt: MutationResolvers['moveTemplatePrompt'] = async (
  _source,
  {promptId, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const prompt = await dataLoader.get('reflectPrompts').load(promptId)

  if (!prompt || prompt.removedAt) {
    throw new GraphQLError('Prompt not found')
  }
  const {teamId} = prompt
  await pg.updateTable('ReflectPrompt').set({sortOrder}).where('id', '=', promptId).execute()
  dataLoader.clearAll('reflectPrompts')
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'MoveTemplatePromptSuccess', data, subOptions)
  return data
}

export default moveTemplatePrompt
