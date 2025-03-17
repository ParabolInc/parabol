import {Selectable} from 'kysely'
import {User as UserPG} from './pg'
import AuthIdentityGoogle from '../../database/types/AuthIdentityGoogle'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import AuthIdentityMicrosoft from '../../database/types/AuthIdentityMicrosoft'

export type Identities = (AuthIdentityGoogle | AuthIdentityLocal | AuthIdentityMicrosoft)[]

export interface User extends Omit<Selectable<UserPG>, 'identities'> {
  identities: Identities
  tms: string[]
}
