import type AuthIdentityGoogle from '../../database/types/AuthIdentityGoogle'
import type AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import type AuthIdentityMicrosoft from '../../database/types/AuthIdentityMicrosoft'
import type {IGetUsersByIdsQueryResult} from '../queries/generated/getUsersByIdsQuery'

interface IUser extends Omit<IGetUsersByIdsQueryResult, 'identities'> {
  identities: (AuthIdentityGoogle | AuthIdentityLocal | AuthIdentityMicrosoft)[]
}

export default IUser
