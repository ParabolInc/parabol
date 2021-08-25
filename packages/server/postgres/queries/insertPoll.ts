import getPg from '../getPg'
import {IInsertPollQueryParams, insertPollQuery} from './generated/insertPollQuery'

const insertPoll = async (poll: IInsertPollQueryParams) => {
  return insertPollQuery.run(poll, getPg())
}

export default insertPoll
