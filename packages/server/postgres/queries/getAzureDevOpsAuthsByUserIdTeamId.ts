import getPg from '../getPg'
import {
  getAzureDevOpsAuthByUserIdTeamIdQuery,
  IGetAzureDevOpsAuthByUserIdTeamIdQueryResult
} from './generated/getAzureDevOpsAuthByUserIdTeamIdQuery'

export interface AzureDevOpsAuth
  extends Omit<IGetAzureDevOpsAuthByUserIdTeamIdQueryResult, 'azureDevOpsSearchQueries'> {
  azureDevOpsSearchQueries: {
    id: string
    queryString: string
    projectKeyFilters?: string[]
    lastUsedAt: Date
    isWIQL: boolean
  }[]
}

const getAzureDevOpsAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getAzureDevOpsAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  if (!res) return null
  return {
    ...res //,
    /*azureDevOpsSearchQueries: res.azureDevOpsSearchQueries.map((adosq: any) => ({
      ...adosq,
      lastUsedAt: new Date(adosq.lastUsedAt)
    }))*/
  } as AzureDevOpsAuth
}

export default getAzureDevOpsAuthByUserIdTeamId
