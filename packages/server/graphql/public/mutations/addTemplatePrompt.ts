import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import {PALETTE} from '../../../../client/styles/paletteV3'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import promptTemplateRules, {isPromptTemplateType} from './helpers/promptTemplateRules'

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
  const activePrompts = await dataLoader.get('templatePromptsByTemplateId').load(templateId)

  if (activePrompts.length >= promptTemplateRules[template.type].maxPrompts) {
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

  await pg.insertInto('TemplatePrompt').values(prompt).execute()

  dataLoader.clearAll('templatePrompts')
  const data = {promptId: prompt.id}
  publish(SubscriptionChannel.TEAM, teamId, 'AddTemplatePromptSuccess', data, subOptions)
  return data
}

export default addTemplatePrompt
