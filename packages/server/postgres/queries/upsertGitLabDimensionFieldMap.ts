import getPg from '../getPg'
import {upsertGitLabDimensionFieldMapQuery} from './generated/upsertGitLabDimensionFieldMapQuery'

const upsertGitLabDimensionFieldMap = async (
  teamId: string,
  dimensionName: string,
  projectPath: string,
  labelTemplate: string
) => {
  return upsertGitLabDimensionFieldMapQuery.run(
    {fieldMap: {teamId, dimensionName, projectPath, labelTemplate}},
    getPg()
  )
}
export default upsertGitLabDimensionFieldMap
