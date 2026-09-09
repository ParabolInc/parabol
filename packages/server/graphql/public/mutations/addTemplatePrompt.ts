import {GraphQLError} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import {PALETTE} from '../../../../client/styles/paletteV3'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import {isPromptTemplateType} from './helpers/isPromptTemplateType'

const addTemplatePrompt: MutationResolvers['addTemplatePrompt'] = async (
  _source,
  {templateId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)

  if (!template || !template.isActive || !isPromptTemplateType(template.type)) {
    throw new GraphQLError('Template not found')
  }
  const {teamId} = template
  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
  const activePrompts = prompts.filter(({removedAt}) => !removedAt)

  if (activePrompts.length >= Threshold.MAX_REFLECTION_PROMPTS) {
    throw new GraphQLError('Too many prompts')
  }

  const lastPrompt = activePrompts.at(-1)
  const sortOrder = positionAfter(lastPrompt?.sortOrder ?? '')
  const pickedColors = activePrompts.map((prompt) => prompt.groupColor)
  const availableNewColor = palettePickerOptions.find((color) => !pickedColors.includes(color.hex))
  const prompt = {
    id: generateUID(),
    templateId: template.id,
    teamId: template.teamId,
    sortOrder,
    question: `New prompt #${activePrompts.length + 1}`,
    description: '',
    groupColor: availableNewColor?.hex ?? PALETTE.JADE_400,
    removedAt: null
  }

  await pg.insertInto('ReflectPrompt').values(prompt).execute()

  dataLoader.clearAll('reflectPrompts')
  const data = {promptId: prompt.id}
  publish(SubscriptionChannel.TEAM, teamId, 'AddTemplatePromptSuccess', data, subOptions)
  return data
}

export default addTemplatePrompt
