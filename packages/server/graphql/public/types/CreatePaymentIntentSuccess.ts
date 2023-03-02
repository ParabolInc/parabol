import {CreatePaymentIntentSuccessResolvers} from '../resolverTypes'

export type CreatePaymentIntentSuccessSource = {
  clientSecret: string
}

const CreatePaymentIntentSuccess: CreatePaymentIntentSuccessResolvers = {
  clientSecret: async ({clientSecret}) => clientSecret
}

export default CreatePaymentIntentSuccess
