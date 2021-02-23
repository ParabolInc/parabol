import User from '../../database/types/User'
import {insertUserQuery} from '../queries/generated/insertUserQuery'
import getPg from '../getPg'
import mapUsers from '../mappers/mapUsers'

const insertUser = (users: User[]): Promise<void[]> => {
  const pgUsers = mapUsers(users)
  return insertUserQuery.run({users: pgUsers}, getPg())
}

export default insertUser
