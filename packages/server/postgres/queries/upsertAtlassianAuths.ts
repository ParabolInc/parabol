import getPg from '../getPg'
import {
  type IUpsertAtlassianAuthsQueryParams,
  upsertAtlassianAuthsQuery
} from './generated/upsertAtlassianAuthsQuery'

const upsertAtlassianAuths = async (auths: IUpsertAtlassianAuthsQueryParams['auths']) => {
  await upsertAtlassianAuthsQuery.run({auths}, getPg())
}
export default upsertAtlassianAuths
