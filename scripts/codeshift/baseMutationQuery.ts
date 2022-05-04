import getPg from '../getPg'
import {MUTATION_NAMEQuery} from './generated/MUTATION_NAMEQuery'

const MUTATION_NAMEToPG = async () => {
  return MUTATION_NAMEQuery.run({} as any, getPg())
}
export default MUTATION_NAMEToPG
