import type {MUTATION_PAYLOADResolvers} from '../resolverTypes'

export type MUTATION_PAYLOADSource = {
  id: string
}

const MUTATION_PAYLOAD: MUTATION_PAYLOADResolvers = {
  successField: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('').load(id)
  }
}

export default MUTATION_PAYLOAD
