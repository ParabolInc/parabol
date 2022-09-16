import getPg from '../getPg'
import {
  getPollOptionsByPollIdsQuery,
  IGetPollOptionsByPollIdsQueryResult
} from './generated/getPollOptionsByPollIdsQuery'

export interface PollOption extends IGetPollOptionsByPollIdsQueryResult {}

const getPollOptionsByPollIds = async (pollIds: readonly number[]) =>
  getPollOptionsByPollIdsQuery.run({pollIds}, getPg())

export default getPollOptionsByPollIds
