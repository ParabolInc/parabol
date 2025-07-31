import getPg from '../getPg'
import {
  type IUpsertJiraServerDimensionFieldMapQueryParams,
  upsertJiraServerDimensionFieldMapQuery
} from './generated/upsertJiraServerDimensionFielMapQuery'

export type UpsertJiraServerDimensionFieldMapParams =
  IUpsertJiraServerDimensionFieldMapQueryParams['fieldMap']

const upsertJiraServerDimensionFieldMap = async (
  fieldMap: UpsertJiraServerDimensionFieldMapParams
) => {
  return upsertJiraServerDimensionFieldMapQuery.run({fieldMap}, getPg())
}
export default upsertJiraServerDimensionFieldMap
