import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {IntegrationDimensionFieldMap} from '../../postgres/types'
import type {DimensionFieldKey} from './ServerIntegrationDefinition'

const isSentinel = (fieldId: string) =>
  fieldId === SprintPokerDefaults.SERVICE_FIELD_COMMENT ||
  fieldId === SprintPokerDefaults.SERVICE_FIELD_NULL

const pickDimensionField = (rows: IntegrationDimensionFieldMap[], key: DimensionFieldKey) => {
  const {issueType, usableFieldIds} = key
  const isUsable = (row: IntegrationDimensionFieldMap) =>
    !usableFieldIds || isSentinel(row.fieldId) || usableFieldIds.includes(row.fieldId)
  const exact = rows.find((row) => row.issueType === issueType && isUsable(row))
  if (exact) return exact
  if (!usableFieldIds) return null
  return rows.find(isUsable) ?? null
}

export default pickDimensionField
