import type {DimensionFieldCtx, ServiceField} from '../platform/ServerIntegrationDefinition'
import type {ClickUpApiSpace} from './ClickUpApiTypes'

type SprintPointsState = 'enabled' | 'disabled' | 'unknown'

const ESTIMATE_FIELD_TYPES = new Map([
  ['number', 'number'],
  ['drop_down', 'drop_down'],
  ['short_text', 'string'],
  ['text', 'string']
])

export const toClickUpEstimateFieldType = (customFieldType: string) =>
  ESTIMATE_FIELD_TYPES.get(customFieldType)

const toSprintPointsState = (space: ClickUpApiSpace | null): SprintPointsState => {
  if (!space) return 'unknown'
  return space.features?.points?.enabled === true ? 'enabled' : 'disabled'
}

export const loadClickUpEstimateFields = async ({task, dataLoader, teamId}: DimensionFieldCtx) => {
  const {integration} = task
  if (integration?.service !== 'clickup') return null
  const {accessUserId: userId, taskId} = integration
  const clickUpTask = await dataLoader.get('clickUpTask').load({teamId, userId, taskId})
  if (!clickUpTask) return null
  const space = await dataLoader
    .get('clickUpSpace')
    .load({teamId, userId, spaceId: clickUpTask.spaceId})
  const customFields = clickUpTask.customFields.flatMap(({id, name, type}): ServiceField[] => {
    const fieldType = toClickUpEstimateFieldType(type)
    return fieldType ? [{fieldId: id, label: name, type: fieldType}] : []
  })
  return {clickUpTask, sprintPoints: toSprintPointsState(space), customFields}
}
