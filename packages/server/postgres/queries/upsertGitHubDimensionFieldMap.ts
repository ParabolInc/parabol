import getPg from '../getPg'
import {upsertGitHubDimensionFieldMapQuery} from './generated/upsertGitHubDimensionFieldMapQuery'

const upsertGitHubDimensionFieldMap = async (
  teamId: string,
  dimensionName: string,
  nameWithOwner: string,
  labelTemplate: string
) => {
  return upsertGitHubDimensionFieldMapQuery.run(
    {fieldMap: {teamId, dimensionName, nameWithOwner, labelTemplate}},
    getPg()
  )
}
export default upsertGitHubDimensionFieldMap
