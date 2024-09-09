import AuthIdentityGoogle from '../../database/types/AuthIdentityGoogle'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import AuthIdentityMicrosoft from '../../database/types/AuthIdentityMicrosoft'
import {IGetUsersByIdsQueryResult} from '../queries/generated/getUsersByIdsQuery'

interface IUser extends Omit<IGetUsersByIdsQueryResult, 'identities'> {
  identities: (AuthIdentityGoogle | AuthIdentityLocal | AuthIdentityMicrosoft)[]
}

export default IUser
