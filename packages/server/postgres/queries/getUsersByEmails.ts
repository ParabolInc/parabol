import getKysely from '../getKysely'
import IUser from '../types/IUser'

export type UserWithTms = IUser & {tms: string[]}

export const getUsersByEmails = async (emails: string[]): Promise<UserWithTms[]> => {
  const pg = getKysely()
  const users = await pg.selectFrom('User')
    .innerJoin('TeamMember', 'User.id', 'TeamMember.userId')
    .selectAll()
    .select(({fn}) => fn.agg('array_agg', ['TeamMember.teamId']).distinct().as('tms'))
    .where('User.email', 'in', emails)
    .groupBy('User.id')
    .execute()
  return users as unknown as UserWithTms[]
}

export const getUserByEmail = async (email: string): Promise<UserWithTms | null> => {
  const users = await getUsersByEmails([email])
  return users[0] ?? null
}
