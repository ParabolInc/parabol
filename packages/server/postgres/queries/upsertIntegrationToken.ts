import getPg from '../getPg'
import {
  IUpsertIntegrationTokenQueryParams,
  upsertIntegrationTokenQuery
} from './generated/upsertIntegrationTokenQuery'

const upsertGitHubAuth = async (auth: IUpsertIntegrationTokenQueryParams['auth']) => {
  await upsertIntegrationTokenQuery.run({auth}, getPg())
}
export default upsertGitHubAuth
