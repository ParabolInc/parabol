import {getUsersByIdQuery, IGetUsersByIdQueryResult} from './generated/getUsersByIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

export interface IGetUsersByIdResult extends IGetUsersByIdQueryResult {}

const getUsersById = async (userIds: string[]): Promise<IGetUsersByIdQueryResult[]> => {
  return await catchAndLog(() => getUsersByIdQuery.run({ids: userIds}, getPg()))
}

export default getUsersById
