import {SUCCESS_PAYLOADResolvers} from '../resolverTypes'

export type SUCCESS_PAYLOADSource = {
  id: string
}

const SUCCESS_PAYLOAD: SUCCESS_PAYLOADResolvers = {
  field: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('').load(id)
  }
}

export default SUCCESS_PAYLOAD
