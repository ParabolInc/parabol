import {insertUserQuery, IInsertUserQueryParams} from '../queries/generated/insertUserQuery'
import getPg from '../getPg'
import User from '../../database/types/User'

const insertUser = async (user: User): Promise<void> => {
  const pg = getPg()
  const parameters = (user as unknown) as IInsertUserQueryParams
  await insertUserQuery.run(parameters, pg)
}

export default insertUser
