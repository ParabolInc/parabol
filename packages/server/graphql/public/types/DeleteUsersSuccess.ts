import isValid from '../../isValid'
import {DeleteUsersSuccessResolvers} from '../resolverTypes'

export type DeleteUsersSuccessSource = {
  deletedUserIds: string[]
}

const DeleteUsersSuccess: DeleteUsersSuccessResolvers = {
  deletedUsers: async ({deletedUserIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(deletedUserIds)).filter(isValid)
    return users
  }
}

export default DeleteUsersSuccess
