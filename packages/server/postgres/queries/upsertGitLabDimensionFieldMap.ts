import getPg from '../getPg'
import {upsertGitLabDimensionFieldMapQuery} from './generated/upsertGitLabDimensionFieldMapQuery'

const upsertGitLabDimensionFieldMap = async (
  teamId: string,
  dimensionName: string,
  gid: string,
  labelTemplate: string
) => {
  return upsertGitLabDimensionFieldMapQuery.run(
    {fieldMap: {teamId, dimensionName, gid, labelTemplate}},
    getPg()
  )
}
export default upsertGitLabDimensionFieldMap
