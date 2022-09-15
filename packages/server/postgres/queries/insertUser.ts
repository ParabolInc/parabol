import AuthIdentity from '../../database/types/AuthIdentity'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'
import {IInsertUserQueryParams, insertUserQuery} from './generated/insertUserQuery'

interface InsertUserQueryParams extends Omit<IInsertUserQueryParams, 'identities'> {
  identities: AuthIdentity[]
}

type Diff<T, U> = T extends U ? never : T

type RequiredExceptFor<T, TOptional extends keyof T> = Pick<T, Diff<keyof T, TOptional>> &
  Partial<T>

type InsertUserQueryParamsWithoutSegmentId = RequiredExceptFor<InsertUserQueryParams, 'segmentId'>

const insertUser = async (user: InsertUserQueryParamsWithoutSegmentId) => {
  await catchAndLog(() => insertUserQuery.run(user as unknown as IInsertUserQueryParams, getPg()))
}

export default insertUser
