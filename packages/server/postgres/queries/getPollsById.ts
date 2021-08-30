import {getPollsByIdQuery, IGetPollsByIdQueryResult} from './generated/getPollsByIdQuery'
import getPg from '../getPg'

export interface Poll extends IGetPollsByIdQueryResult {}

const getPollsById = async (ids: readonly number[]) => getPollsByIdQuery.run({ids}, getPg())

export default getPollsById
