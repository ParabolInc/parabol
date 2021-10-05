import {
  getPollOptionsByPollIdsQuery,
  IGetPollOptionsByPollIdsQueryResult
} from './generated/getPollOptionsByPollIdsQuery'
import getPg from '../getPg'

export interface PollOption extends IGetPollOptionsByPollIdsQueryResult {}

const getPollOptionsByPollIds = async (pollIds: readonly number[]) =>
  getPollOptionsByPollIdsQuery.run({pollIds}, getPg())

export default getPollOptionsByPollIds
