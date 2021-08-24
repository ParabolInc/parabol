import {MaybeReadonly} from '../../../client/types/generics'
import {getPollsByIdQuery} from './generated/getPollsByIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

const getPollsById = async (pollIds: MaybeReadonly<number[]>) => {
  return await catchAndLog(() => getPollsByIdQuery.run({ids: pollIds as any}, getPg()))
}

export default getPollsById
