import isValid from '../../../graphql/isValid'
import {ChangeEmailDomainSuccessResolvers} from '../../private/resolverTypes'

export type ChangeEmailDomainSuccessSource = {
  updatedUserIds: string[]
  duplicateUserIds: string[]
}

const ChangeEmailDomainSuccess: ChangeEmailDomainSuccessResolvers = {
  updatedUsers: async ({updatedUserIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(updatedUserIds)).filter(isValid)
    return users
  },
  duplicateUsers: async ({duplicateUserIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(duplicateUserIds)).filter(isValid)
    return users
  }
}

export default ChangeEmailDomainSuccess
