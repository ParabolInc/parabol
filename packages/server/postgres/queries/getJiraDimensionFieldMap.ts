import getPg from '../getPg'
import {
  getJiraDimensionFieldMapQuery,
  IGetJiraDimensionFieldMapQueryParams,
  IGetJiraDimensionFieldMapQueryResult
} from './generated/getJiraDimensionFieldMapQuery'

export interface JiraDimensionFieldMap extends IGetJiraDimensionFieldMapQueryResult {}
export interface GetJiraDimensionFieldMapParams extends IGetJiraDimensionFieldMapQueryParams {}

const getJiraDimensionFieldMap = async (params: GetJiraDimensionFieldMapParams) => {
  const res = await getJiraDimensionFieldMapQuery.run(params, getPg())
  return res as JiraDimensionFieldMap[]
}
export default getJiraDimensionFieldMap
