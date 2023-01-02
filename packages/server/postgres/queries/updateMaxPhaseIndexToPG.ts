import getPg from '../getPg'
import {updateMaxPhaseIndexQuery} from './generated/updateMaxPhaseIndexQuery'

const updateMaxPhaseIndexToPG = async () => {
  return updateMaxPhaseIndexQuery.run({} as any, getPg())
}
export default updateMaxPhaseIndexToPG
