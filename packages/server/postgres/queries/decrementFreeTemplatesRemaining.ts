import getPg from '../getPg'
import {decrementFreeRetroTemplatesRemainingQuery} from './generated/decrementFreeCustomRetroTemplatesRemainingQuery'
import {decrementFreePokerTemplatesRemainingQuery} from './generated/decrementFreeCustomPokerTemplatesRemainingQuery'

const decrementFreeTemplatesRemaining = async (userId: string, templateType: 'retro' | 'poker') => {
  const res =
    templateType === 'retro'
      ? await decrementFreeRetroTemplatesRemainingQuery.run({userId}, getPg())
      : await decrementFreePokerTemplatesRemainingQuery.run({userId}, getPg())
  return res
}

export default decrementFreeTemplatesRemaining
