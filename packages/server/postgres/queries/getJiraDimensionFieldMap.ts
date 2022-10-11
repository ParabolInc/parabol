import getPg from '../getPg'
import {
  getJiraDimensionFieldMapQuery,
  IGetJiraDimensionFieldMapQueryParams,
  IGetJiraDimensionFieldMapQueryResult
} from './generated/getJiraDimensionFieldMapQuery'

export interface JiraDimensionFieldMap extends IGetJiraDimensionFieldMapQueryResult {}
export interface GetJiraDimensionFieldMapParams extends IGetJiraDimensionFieldMapQueryParams {}

const getJiraDimensionFieldMap = async (params: GetJiraDimensionFieldMapParams) => {
  // pg-typed doesnt' support records, so we can't use multiple composite keys
  // https://github.com/adelsz/pgtyped/issues/317
  const res = await getJiraDimensionFieldMapQuery.run(params as any, getPg())
  return res as JiraDimensionFieldMap[]
}
export default getJiraDimensionFieldMap
