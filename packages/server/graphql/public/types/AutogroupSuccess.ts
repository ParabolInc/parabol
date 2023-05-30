import {AutogroupSuccessResolvers} from '../resolverTypes'

export type AutogroupSuccessSource = {
  id: string
}

const AutogroupSuccess: AutogroupSuccessResolvers = {
  successField: async ({id}, _args, {dataLoader}) => {
    // return dataLoader.get('').load(id)
    return true
  }
}

export default AutogroupSuccess
