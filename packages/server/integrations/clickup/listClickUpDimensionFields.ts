import type {
  DimensionFieldCtx,
  ServiceField,
  ServiceFieldListing
} from '../platform/ServerIntegrationDefinition'
import {loadClickUpEstimateFields} from './clickUpEstimateFields'

export const CLICKUP_SPRINT_POINTS_FIELD = '__sprintPoints'

const SPRINT_POINTS_HELP_URL =
  'https://help.clickup.com/hc/en-us/articles/6303883602327-Use-Sprint-Points'

const SPRINT_POINTS: ServiceField = {
  fieldId: CLICKUP_SPRINT_POINTS_FIELD,
  label: 'Sprint Points',
  type: 'number'
}

const listClickUpDimensionFields = async (ctx: DimensionFieldCtx): Promise<ServiceFieldListing> => {
  const estimateFields = await loadClickUpEstimateFields(ctx)
  if (!estimateFields) return {options: []}
  const {sprintPoints, customFields} = estimateFields
  return sprintPoints === 'enabled'
    ? {options: [SPRINT_POINTS, ...customFields]}
    : {options: customFields, helpUrl: SPRINT_POINTS_HELP_URL}
}

export default listClickUpDimensionFields
