import {IGetUsersByIdsQueryResult} from '../queries/generated/getUsersByIdsQuery'

interface IUser extends IGetUsersByIdsQueryResult {
  identities: {
    isEmailVerified: boolean
    type: 'GOOGLE' | 'LOCAL'
    id: string
  }[]
}

export default IUser
