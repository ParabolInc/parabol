import {getPollsByIdQuery} from './generated/getPollsByIdQuery'
import getPg from '../getPg'

const getPollsById = async (ids: readonly number[]) => {
  return getPollsByIdQuery.run({ids}, getPg())
}

export default getPollsById
