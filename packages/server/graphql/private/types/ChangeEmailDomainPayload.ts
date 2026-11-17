import isValid from '../../../graphql/isValid'
import type {ChangeEmailDomainPayloadResolvers} from '../../private/resolverTypes'

export type ChangeEmailDomainPayloadSource = {
  usersUpdatedIds: string[]
  usersNotUpdatedIds: string[]
}

const ChangeEmailDomainPayload: ChangeEmailDomainPayloadResolvers = {
  usersUpdated: async ({usersUpdatedIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(usersUpdatedIds)).filter(isValid)
    return users
  },
  usersNotUpdated: async ({usersNotUpdatedIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(usersNotUpdatedIds)).filter(isValid)
    return users
  }
}

export default ChangeEmailDomainPayload
