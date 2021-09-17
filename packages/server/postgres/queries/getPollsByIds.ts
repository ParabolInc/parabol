import {getPollsByIdsQuery, IGetPollsByIdsQueryResult} from './generated/getPollsByIdsQuery'
import getPg from '../getPg'

export interface Poll extends IGetPollsByIdsQueryResult {}

const getPollsByIds = async (ids: readonly number[]) => getPollsByIdsQuery.run({ids}, getPg())

export default getPollsByIds
