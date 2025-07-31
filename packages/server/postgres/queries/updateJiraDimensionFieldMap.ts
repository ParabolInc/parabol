import getPg from '../getPg'
import {
  type IUpdateJiraDimensionFieldMapQueryParams,
  updateJiraDimensionFieldMapQuery
} from './generated/updateJiraDimensionFieldMapQuery'

export type UpdateJiraDimensionFieldMapParams = IUpdateJiraDimensionFieldMapQueryParams

const updateJiraDimensionFieldMap = async (fieldMap: UpdateJiraDimensionFieldMapParams) => {
  return updateJiraDimensionFieldMapQuery.run(fieldMap, getPg())
}
export default updateJiraDimensionFieldMap
