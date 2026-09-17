import type {Selectable} from 'kysely'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {UserDetail} from '../postgres/types/pg'

type UserDetailValues = Omit<Selectable<UserDetail>, 'id'>

export type UserDetailColumn = keyof UserDetailValues

export const USER_DETAIL_DEFAULTS: UserDetailValues = {
  bytesUploaded: '0',
  freeCustomPokerTemplatesRemaining: 2,
  freeCustomRetroTemplatesRemaining: 2,
  freeCustomStandupTemplatesRemaining: 2
}

const getUserDetail = async <Column extends UserDetailColumn>(
  userId: string,
  column: Column,
  dataLoader: DataLoaderWorker
): Promise<UserDetailValues[Column]> => {
  const userDetail = await dataLoader.get('userDetails').load(userId)
  return userDetail?.[column] ?? USER_DETAIL_DEFAULTS[column]
}

export default getUserDetail
