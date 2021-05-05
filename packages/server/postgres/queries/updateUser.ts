import {
  updateUserQuery,
  IUpdateUserQueryParams
} from './generated/updateUserQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'
import AuthIdentity from '../../database/types/AuthIdentity'

interface UpdateUserQueryParams extends Omit<IUpdateUserQueryParams, 'identities'> {
  identities: AuthIdentity[]
}

const updateUser = async (
  update: Partial<UpdateUserQueryParams>,
  userIds: string | string[]
) => {
  userIds = typeof userIds === 'string' ? [userIds] : userIds
  return await catchAndLog(() =>
    updateUserQuery.run(
      {
        ...update,
        ids: userIds
      } as IUpdateUserQueryParams,
      getPg()
    )
  )
}

export default updateUser
