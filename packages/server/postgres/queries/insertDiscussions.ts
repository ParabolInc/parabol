import {DeepNonNullable} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  IInsertDiscussionsQueryParams,
  insertDiscussionsQuery
} from './generated/insertDiscussionsQuery'

type Discussions = DeepNonNullable<IInsertDiscussionsQueryParams['discussions']>

const insertDiscussions = async (discussions: Discussions) => {
  if (discussions.length === 0) return
  insertDiscussionsQuery.run({discussions}, getPg())
}

export default insertDiscussions
