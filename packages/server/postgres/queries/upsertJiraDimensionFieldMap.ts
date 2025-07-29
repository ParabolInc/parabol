import getPg from '../getPg'
import {
  type IUpsertJiraDimensionFieldMapQueryParams,
  upsertJiraDimensionFieldMapQuery
} from './generated/upsertJiraDimensionFieldMapQuery'

export type UpsertJiraDimensionFieldMapParams = IUpsertJiraDimensionFieldMapQueryParams['fieldMap']

const upsertJiraDimensionFieldMap = async (fieldMap: UpsertJiraDimensionFieldMapParams) => {
  return upsertJiraDimensionFieldMapQuery.run({fieldMap}, getPg())
}
export default upsertJiraDimensionFieldMap
