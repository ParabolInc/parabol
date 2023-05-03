import {DomainJoinRequestResolvers} from '../resolverTypes'

const DomainJoinRequest: DomainJoinRequestResolvers = {
  createdByEmail: async ({createdBy}, _args, {dataLoader}) => {
    const user = await dataLoader.get('users').loadNonNull(createdBy)
    return user.email
  }
}

export default DomainJoinRequest
