import getPg from '../getPg'
import {
  getUniqueTaskEstimatesByDimensionNameQuery,
  IGetUniqueTaskEstimatesByDimensionNameQueryResult
} from './generated/getUniqueTaskEstimatesByDimensionNameQuery'

export interface getUniqueTaskEstimatesByDimensionNameResult
  extends IGetUniqueTaskEstimatesByDimensionNameQueryResult {}

const getUniqueTaskEstimatesByDimensionName = async (
  dimensionName: string,
  teamId: string,
  nameWithOwner: string
) => {
  const result = await getUniqueTaskEstimatesByDimensionNameQuery.run(
    {
      dimensionName,
      teamId,
      nameWithOwner
    },
    getPg()
  )
  return result as getUniqueTaskEstimatesByDimensionNameResult[]
}
export default getUniqueTaskEstimatesByDimensionName
