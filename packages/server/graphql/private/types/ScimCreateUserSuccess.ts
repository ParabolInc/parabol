import {ScimCreateUserSuccessResolvers} from '../resolverTypes'

export type ScimCreateUserSuccessSource = {
  userId: string
  isNewUser: boolean
}

const ScimCreateUserSuccess: ScimCreateUserSuccessResolvers = {
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default ScimCreateUserSuccess
