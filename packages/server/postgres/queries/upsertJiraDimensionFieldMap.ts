import getPg from '../getPg'
import {
  IUpsertJiraDimensionFieldMapQueryParams,
  upsertJiraDimensionFieldMapQuery
} from './generated/upsertJiraDimensionFieldMapQuery'

export type UpsertJiraDimensionFieldMapParams = IUpsertJiraDimensionFieldMapQueryParams['fieldMap']

const upsertJiraDimensionFieldMap = async (fieldMap: UpsertJiraDimensionFieldMapParams) => {
  return upsertJiraDimensionFieldMapQuery.run({fieldMap}, getPg())
}
export default upsertJiraDimensionFieldMap
