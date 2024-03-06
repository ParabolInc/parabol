import getPg from '../getPg'
import {decrementFreeTemplatesRemainingQuery} from './generated/decrementFreeCustomTemplatesRemainingQuery'

const decrementFreeTemplatesRemaining = async (userId: string) => {
  const res = await decrementFreeTemplatesRemainingQuery.run({userId}, getPg())
  return res
}

export default decrementFreeTemplatesRemaining
