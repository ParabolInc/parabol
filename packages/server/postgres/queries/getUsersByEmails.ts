import {getUsersByEmailsQuery} from './generated/getUsersByEmailsQuery'
import getPg from '../getPg'
import AuthIdentity from '../../database/types/AuthIdentity'
import User from '../../database/types/User'
import {AuthTokenRole} from 'parabol-client/types/constEnums'

export const getUsersByEmails = async (emails: string[]): Promise<User[]> => {
  const users = await getUsersByEmailsQuery.run({emails}, getPg())
  return (
    // TODO #5372 remove conversion to User
    users?.map((user) => ({
      ...user,
      segmentId: user.segmentId ?? undefined,
      reasonRemoved: user.reasonRemoved ?? undefined,
      rol: user.rol === 'su' ? AuthTokenRole.SUPER_USER : undefined,
      identities: (user.identities as unknown) as AuthIdentity[]
    })) ?? []
  )
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getUsersByEmails([email])
  return users[0] ?? null
}
