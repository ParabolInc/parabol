import User from '../../database/types/User'
import {insertUserQuery} from '../queries/generated/insertUserQuery'
import getPg from '../getPg'
import prepareJson from '../utils/prepareJson'

const insertUser = (user: User): Promise<void[]> => {
  const mappedUser = Object.assign({}, user, {identities: prepareJson(user.identities)})
  return insertUserQuery.run(mappedUser, getPg())
}

export default insertUser
