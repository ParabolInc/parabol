import AuthIdentity from '../../database/types/AuthIdentity'
import getPg from '../getPg'
import {IUpdateUserQueryParams, updateUserQuery} from './generated/updateUserQuery'

interface UpdateUserQueryParams extends Omit<IUpdateUserQueryParams, 'identities'> {
  identities: AuthIdentity[]
}

const updateUser = async (update: Partial<UpdateUserQueryParams>, userIds: string | string[]) => {
  userIds = typeof userIds === 'string' ? [userIds] : userIds
  return updateUserQuery.run(
    {
      ...update,
      ids: userIds
    } as any,
    getPg()
  )
}

export default updateUser
