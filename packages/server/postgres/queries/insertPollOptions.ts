import getPg from '../getPg'
import {
  IInsertPollOptionQueryParams,
  insertPollOptionQuery
} from './generated/insertPollOptionsQuery'

const insertPollOptions = async (pollOptions: IInsertPollOptionQueryParams) => {
  await insertPollOptionQuery.run(pollOptions, getPg())
}

export default insertPollOptions
