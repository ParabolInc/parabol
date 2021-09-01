import getPg from '../getPg'
import {
  IUpsertAtlassianAuthQueryParams,
  upsertAtlassianAuthQuery
} from './generated/upsertAtlassianAuthQuery'

const upsertAtlassianAuth = async (auth: IUpsertAtlassianAuthQueryParams['auth']) => {
  await upsertAtlassianAuthQuery.run({auth}, getPg())
}
export default upsertAtlassianAuth
