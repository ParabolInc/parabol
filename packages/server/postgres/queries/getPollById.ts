import {getPollsByIdQuery} from './generated/getPollsByIdQuery'
import getPg from '../getPg'

const getPollsById = async (ids: readonly number[]) => getPollsByIdQuery.run({ids}, getPg())

export default getPollsById
