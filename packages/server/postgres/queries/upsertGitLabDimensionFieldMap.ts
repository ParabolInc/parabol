import getPg from '../getPg'
import {upsertGitLabDimensionFieldMapQuery} from './generated/upsertGitLabDimensionFieldMapQuery'

const upsertGitLabDimensionFieldMap = async (
  teamId: string,
  dimensionName: string,
  projectId: number,
  providerId: number,
  labelTemplate: string
) => {
  return upsertGitLabDimensionFieldMapQuery.run(
    {fieldMap: {teamId, dimensionName, projectId, providerId, labelTemplate}},
    getPg()
  )
}
export default upsertGitLabDimensionFieldMap
