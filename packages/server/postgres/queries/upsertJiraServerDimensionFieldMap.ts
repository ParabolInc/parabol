import getPg from '../getPg'
import {IUpsertJiraServerDimensionFieldMapQueryParams, upsertJiraServerDimensionFieldMapQuery} from './generated/upsertJiraServerDimensionFielMapQuery'

export type UpsertJiraServerDimensionFieldMapParams = IUpsertJiraServerDimensionFieldMapQueryParams['fieldMap']

const upsertJiraServerDimensionFieldMap = async (fieldMap: UpsertJiraServerDimensionFieldMapParams) => {
  return upsertJiraServerDimensionFieldMapQuery.run(
    {fieldMap},
    getPg()
  )
}
export default upsertJiraServerDimensionFieldMap
