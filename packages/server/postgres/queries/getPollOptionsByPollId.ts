import {getPollOptionsByPollIdQuery} from './generated/getPollsOptionsByPollIdQuery'
import getPg from '../getPg'

const getPollOptionsByPollId = async (pollIds: readonly number[]) =>
  getPollOptionsByPollIdQuery.run({pollIds}, getPg())

export default getPollOptionsByPollId
