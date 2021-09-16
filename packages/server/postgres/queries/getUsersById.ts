import {getUsersByIdQuery, IGetUsersByIdQueryResult} from './generated/getUsersByIdQuery'
import getPg from '../getPg'

export interface IGetUsersByIdResult extends IGetUsersByIdQueryResult {}

const getUsersById = async (userIds: string[]) => {
  return getUsersByIdQuery.run({ids: userIds}, getPg())
}

export default getUsersById
