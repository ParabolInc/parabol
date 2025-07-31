import getPg from '../getPg'
import {
  type IInsertPollWithOptionsQueryParams,
  insertPollWithOptionsQuery
} from './generated/insertPollWithOptionsQuery'

const insertPollWithOptions = async (poll: IInsertPollWithOptionsQueryParams) =>
  insertPollWithOptionsQuery.run(poll, getPg())

export default insertPollWithOptions
