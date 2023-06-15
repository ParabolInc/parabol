import {UpdateCreditCardSuccessResolvers} from '../resolverTypes'

export type UpdateCreditCardSuccessSource = {
  id: string
}

const UpdateCreditCardSuccess: UpdateCreditCardSuccessResolvers = {
  successField: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('').load(id)
  }
}

export default UpdateCreditCardSuccess
