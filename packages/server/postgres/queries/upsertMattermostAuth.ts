import getPg from '../getPg'
import {
  IUpsertMattermostAuthQueryParams,
  upsertMattermostAuthQuery
} from './generated/upsertMattermostAuthQuery'

const upsertMattermostAuth = async (auth: IUpsertMattermostAuthQueryParams['auth']) => {
  await upsertMattermostAuthQuery.run({auth}, getPg())
}
export default upsertMattermostAuth
