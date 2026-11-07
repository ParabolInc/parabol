import type {
  DimensionFieldCtx,
  ServiceField,
  ServiceFieldListing
} from '../platform/ServerIntegrationDefinition'

export const CLICKUP_SPRINT_POINTS_FIELD = '__sprintPoints'

const SPRINT_POINTS_HELP_URL =
  'https://help.clickup.com/hc/en-us/articles/6303883602327-Use-Sprint-Points'

const SPRINT_POINTS: ServiceField = {
  fieldId: CLICKUP_SPRINT_POINTS_FIELD,
  label: 'Sprint Points',
  type: 'number'
}

const ESTIMATE_FIELD_TYPES = new Map([
  ['number', 'number'],
  ['drop_down', 'drop_down'],
  ['short_text', 'string'],
  ['text', 'string']
])

export const toClickUpEstimateFieldType = (customFieldType: string) =>
  ESTIMATE_FIELD_TYPES.get(customFieldType)

export const loadClickUpEstimateFields = async ({task, dataLoader, teamId}: DimensionFieldCtx) => {
  const {integration} = task
  if (integration?.service !== 'clickup') return null
  const {accessUserId: userId, taskId} = integration
  const clickUpTask = await dataLoader.get('clickUpTask').load({teamId, userId, taskId})
  if (!clickUpTask) return null
  const space = await dataLoader
    .get('clickUpSpace')
    .load({teamId, userId, spaceId: clickUpTask.spaceId})
  const hasSprintPoints = space?.features?.points?.enabled === true
  const customFields = clickUpTask.customFields.flatMap(({id, name, type}) => {
    const fieldType = toClickUpEstimateFieldType(type)
    return fieldType ? [{fieldId: id, label: name, type: fieldType}] : []
  })
  const options = hasSprintPoints ? [SPRINT_POINTS, ...customFields] : customFields
  return {clickUpTask, hasSprintPoints, options}
}

const listClickUpDimensionFields = async (ctx: DimensionFieldCtx): Promise<ServiceFieldListing> => {
  const estimateFields = await loadClickUpEstimateFields(ctx)
  if (!estimateFields) return {options: []}
  const {hasSprintPoints, options} = estimateFields
  return hasSprintPoints ? {options} : {options, helpUrl: SPRINT_POINTS_HELP_URL}
}

export default listClickUpDimensionFields
