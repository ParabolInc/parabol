import {
  getPollOptionsByPollIdQuery,
  IGetPollOptionsByPollIdQueryResult
} from './generated/getPollsOptionsByPollIdQuery'
import getPg from '../getPg'

export interface PollOption extends IGetPollOptionsByPollIdQueryResult {}

const getPollOptionsByPollId = async (pollIds: readonly number[]) =>
  getPollOptionsByPollIdQuery.run({pollIds}, getPg())

export default getPollOptionsByPollId
