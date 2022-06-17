import isValid from '../../../graphql/isValid'
import {ChangeEmailDomainSuccessResolvers} from '../../private/resolverTypes'

export type ChangeEmailDomainSuccessSource = {
  usersUpdatedIds: string[]
  usersNotUpdatedIds: string[]
}

const ChangeEmailDomainSuccess: ChangeEmailDomainSuccessResolvers = {
  usersUpdated: async ({usersUpdatedIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(usersUpdatedIds)).filter(isValid)
    return users
  },
  usersNotUpdated: async ({usersNotUpdatedIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(usersNotUpdatedIds)).filter(isValid)
    return users
  }
}

export default ChangeEmailDomainSuccess
