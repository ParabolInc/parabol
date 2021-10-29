import getPg from '../getPg'
import {getAtlassianAuthsToUpdateQuery} from './generated/getAtlassianAuthsToUpdateQuery'

const getAtlassianAuthsToUpdate = async (updatedAtThreshold: Date) => {
  return getAtlassianAuthsToUpdateQuery.run({updatedAtThreshold}, getPg())
}

export default getAtlassianAuthsToUpdate
