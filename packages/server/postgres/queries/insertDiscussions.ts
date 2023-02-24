import {DeepNonNullable} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  IInsertDiscussionsQueryParams,
  insertDiscussionsQuery
} from './generated/insertDiscussionsQuery'

export type InputDiscussions = DeepNonNullable<IInsertDiscussionsQueryParams['discussions']>

const insertDiscussions = async (discussions: InputDiscussions) => {
  if (discussions.length === 0) return
  insertDiscussionsQuery.run({discussions} as any, getPg())
}

export default insertDiscussions
