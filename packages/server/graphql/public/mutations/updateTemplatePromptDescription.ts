import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateTemplatePromptDescription: MutationResolvers['updateTemplatePromptDescription'] =
  async (_source, {promptId, description}, {dataLoader, socketId: mutatorId}) => {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await dataLoader.get('reflectPrompts').load(promptId)

    if (!prompt || prompt.removedAt) {
      throw new GraphQLError('Prompt not found')
    }
    const {teamId} = prompt
    const normalizedDescription = description.trim().slice(0, 256)

    await pg
      .updateTable('ReflectPrompt')
      .set({description: normalizedDescription})
      .where('id', '=', promptId)
      .execute()
    dataLoader.clearAll('reflectPrompts')
    const data = {promptId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdateTemplatePromptDescriptionSuccess',
      data,
      subOptions
    )
    return data
  }

export default updateTemplatePromptDescription
