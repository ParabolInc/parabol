import getPg from '../getPg'
import {upsertJiraServerDimensionFieldMapQuery} from './generated/upsertJiraServerDimensionFielMapQuery'

const upsertJiraServerDimensionFieldMap = async (fieldMap: {
  providerId: number,
  teamId: string,
  projectId: string,
  dimensionName: string,
  fieldId: string,
  fieldName: string,
  fieldType: string
}) => {
  return upsertJiraServerDimensionFieldMapQuery.run(
    {fieldMap},
    getPg()
  )
}
export default upsertJiraServerDimensionFieldMap
