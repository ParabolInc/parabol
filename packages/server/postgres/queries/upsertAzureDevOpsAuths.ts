import getPg from '../getPg'
import {
  IUpsertAzureDevOpsAuthsQueryParams,
  upsertAzureDevOpsAuthsQuery
} from './generated/upsertAzureDevOpsAuthsQuery'

const upsertAzureDevOpsAuths = async (auths: IUpsertAzureDevOpsAuthsQueryParams['auths']) => {
  await upsertAzureDevOpsAuthsQuery.run({auths}, getPg())
}
export default upsertAzureDevOpsAuths
