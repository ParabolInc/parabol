import {IGetUsersByIdQueryResult} from '../queries/generated/getUsersByIdQuery'

interface IUser extends IGetUsersByIdQueryResult {
  identities: {
    isEmailVerified: boolean
    type: 'GOOGLE' | 'LOCAL'
    id: string
  }[]
}

export default IUser
