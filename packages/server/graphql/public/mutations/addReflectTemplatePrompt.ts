import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import {PALETTE} from '../../../../client/styles/paletteV3'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addReflectTemplatePrompt: MutationResolvers['addReflectTemplatePrompt'] = async (
  _source,
  {templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  const viewerId = getUserId(authToken)

  // AUTH
  if (!template || !template.isActive) {
    return standardError(new Error('Template not found'), {userId: viewerId})
  }
  if (!isTeamMember(authToken, template.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // VALIDATION
  const {teamId} = template
  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
  const activePrompts = prompts.filter(({removedAt}) => !removedAt)

  if (activePrompts.length >= Threshold.MAX_REFLECTION_PROMPTS) {
    return standardError(new Error('Too many prompts'), {userId: viewerId})
  }

  // RESOLUTION
  const lastPrompt = activePrompts.at(-1)
  const sortOrder = positionAfter(lastPrompt?.sortOrder ?? '')
  const pickedColors = activePrompts.map((prompt) => prompt.groupColor)
  const availableNewColor = palettePickerOptions.find((color) => !pickedColors.includes(color.hex))
  const reflectPrompt = {
    id: generateUID(),
    templateId: template.id,
    teamId: template.teamId,
    sortOrder,
    question: `New prompt #${activePrompts.length + 1}`,
    description: '',
    groupColor: availableNewColor?.hex ?? PALETTE.JADE_400,
    removedAt: null
  }

  await pg.insertInto('ReflectPrompt').values(reflectPrompt).execute()

  dataLoader.clearAll('reflectPrompts')
  const promptId = reflectPrompt.id
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplatePromptPayload', data, subOptions)
  return data
}

export default addReflectTemplatePrompt
