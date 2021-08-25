import getPg from '../getPg'
import {
  IInsertPollOptionQueryParams,
  insertPollOptionQuery
} from './generated/insertPollOptionsQuery'

const insertPollOptions = async (pollOptions: IInsertPollOptionQueryParams) =>
  insertPollOptionQuery.run(pollOptions, getPg())

export default insertPollOptions
