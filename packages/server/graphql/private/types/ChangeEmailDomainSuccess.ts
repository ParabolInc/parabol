import isValid from '../../../graphql/isValid'
import {ChangeEmailDomainSuccessResolvers} from '../../private/resolverTypes'

export type ChangeEmailDomainSuccessSource = {
  userIds: string[]
}

const ChangeEmailDomainSuccess: ChangeEmailDomainSuccessResolvers = {
  users: async ({userIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
    return users
  }
}

export default ChangeEmailDomainSuccess
