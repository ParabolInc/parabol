import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'
import loadDimensionField from '../platform/loadDimensionField'
import type {EstimatePushCtx} from '../platform/ServerIntegrationDefinition'
import type {ClickUpApiCustomField} from './ClickUpApiTypes'
import {toClickUpEstimateFieldType} from './clickUpEstimateFields'
import clickUpRequest, {ClickUpRequestError} from './clickUpRequest'
import {CLICKUP_SPRINT_POINTS_FIELD} from './listClickUpDimensionFields'
import makeScoreClickUpComment from './makeScoreClickUpComment'
import resolveClickUpDimensionFieldKey from './resolveClickUpDimensionFieldKey'

const OFF_SCALE_POINTS = 'ITEM_223'

const toNumber = (value: string) => {
  const number = parseFloat(value)
  return Number.isFinite(number) && String(number) === value ? number : null
}

const notANumber = (fieldName: string, value: string) =>
  new Error(`${fieldName} takes a number, and "${value}" is not one`)

const toFieldValue = (field: ClickUpApiCustomField, fieldType: string, value: string) => {
  if (fieldType === 'number') return toNumber(value) ?? notANumber(field.name, value)
  if (fieldType === 'drop_down') {
    const match = value.toLowerCase()
    const option = field.type_config?.options?.find(({name}) => name.toLowerCase() === match)
    return option?.id ?? new Error(`${field.name} has no option named "${value}"`)
  }
  return value
}

const pushEstimateToClickUp = async ({
  task,
  taskEstimate,
  dataLoader,
  context,
  info,
  viewerId,
  meetingName,
  discussionURL
}: EstimatePushCtx): Promise<EstimatePushResult | Error> => {
  const {integration, teamId} = task
  if (integration?.service !== 'clickup') return new Error('Not a ClickUp task')
  const {dimensionName, value} = taskEstimate
  const {accessUserId, taskId, workspaceId} = integration

  const auth = await dataLoader
    .get('freshAuth')
    .load({service: 'clickup', teamId, userId: accessUserId})
  if (!auth?.accessToken) return new Error('User no longer has access to ClickUp')

  const dimensionFieldLookup = await loadDimensionField(
    resolveClickUpDimensionFieldKey,
    {dataLoader, teamId, userId: accessUserId, context, info, task, viewerId},
    dimensionName
  )
  if (!dimensionFieldLookup) return new Error('Cannot read this task from ClickUp')
  const dimensionField = dimensionFieldLookup.field
  const fieldId = dimensionField?.fieldId ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT
  if (fieldId === SprintPokerDefaults.SERVICE_FIELD_NULL) return null

  const taskPath = `/task/${encodeURIComponent(taskId)}`
  if (fieldId === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const comment = await clickUpRequest(auth, `${taskPath}/comment`, {
      method: 'POST',
      body: {
        comment_text: makeScoreClickUpComment(
          dimensionName,
          value || '<None>',
          meetingName,
          discussionURL
        ),
        notify_all: false
      },
      workspaceId
    })
    return comment instanceof Error ? comment : null
  }

  if (fieldId === CLICKUP_SPRINT_POINTS_FIELD) {
    const points = toNumber(value)
    if (points === null) return notANumber('Sprint Points', value)
    const res = await clickUpRequest(auth, taskPath, {
      method: 'PUT',
      body: {points},
      workspaceId
    })
    if (res instanceof ClickUpRequestError && res.code === OFF_SCALE_POINTS) {
      return new Error(
        `ClickUp Sprint Points in this workspace have no "${value}". Add it to the Sprint Points scale in ClickUp, or push this dimension to a custom field`
      )
    }
    if (res instanceof Error) return res
    return {service: 'clickup', target: 'field', targetId: CLICKUP_SPRINT_POINTS_FIELD}
  }

  const clickUpTask = await dataLoader
    .get('clickUpTask')
    .load({teamId, userId: accessUserId, taskId})
  const field = clickUpTask?.customFields.find(({id}) => id === fieldId)
  const fieldType = field && toClickUpEstimateFieldType(field.type)
  if (!field || !fieldType) {
    return new Error(
      `${dimensionField?.fieldName ?? 'That field'} is no longer on this ClickUp task`
    )
  }
  const fieldValue = toFieldValue(field, fieldType, value)
  if (fieldValue instanceof Error) return fieldValue
  const res = await clickUpRequest(auth, `${taskPath}/field/${encodeURIComponent(fieldId)}`, {
    method: 'POST',
    body: {value: fieldValue},
    workspaceId
  })
  if (res instanceof Error) return res
  return {service: 'clickup', target: 'field', targetId: fieldId}
}

export default pushEstimateToClickUp
