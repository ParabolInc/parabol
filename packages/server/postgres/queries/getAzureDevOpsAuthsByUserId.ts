import getPg from '../getPg'
import {getAzureDevOpsAuthsByUserIdQuery} from './generated/getAzureDevOpsAuthsByUserId'
import {AzureDevOpsAuth} from './getAzureDevOpsAuthsByUserIdTeamId'

const getAzureDevOpsAuthsByUserId = async (userId: string) => {
  const res = await getAzureDevOpsAuthsByUserIdQuery.run({userId}, getPg())
  if (!res || res.length === 0) return []
  return res.map((azureDevOpsAuth) => ({
    ...azureDevOpsAuth,
    azureDevOpsSearchQueries: azureDevOpsAuth.azureDevOpsSearchQueries.map((adosq: any) => ({
      ...adosq,
      lastUsedAt: new Date(adosq.lastUsedAt)
    }))
  })) as AzureDevOpsAuth[]
}

export default getAzureDevOpsAuthsByUserId
