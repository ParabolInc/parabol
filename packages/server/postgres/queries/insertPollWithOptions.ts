import getPg from '../getPg'
import {
  IInsertPollWithOptionsQueryParams,
  insertPollWithOptionsQuery
} from './generated/insertPollWithOptionsQuery'

const insertPollWithOptions = async (poll: IInsertPollWithOptionsQueryParams) =>
  insertPollWithOptionsQuery.run(poll, getPg())

export default insertPollWithOptions
