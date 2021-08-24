import {MaybeReadonly} from 'parabol-client/types/generics'
import {getPollOptionsByPollIdQuery} from './generated/getPollsOptionsByPollIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

const getPollOptionsByPollId = async (pollIds: MaybeReadonly<number[]>) => {
  return await catchAndLog(() =>
    getPollOptionsByPollIdQuery.run({pollIds: pollIds as any}, getPg())
  )
}

export default getPollOptionsByPollId
