import {CreatePaymentIntentSuccessResolvers} from '../resolverTypes'

export type CreatePaymentIntentSuccessSource = {
  clientSecret: string
}

const CreatePaymentIntentSuccess: CreatePaymentIntentSuccessResolvers = {
  clientSecret: async ({clientSecret}, _args, {dataLoader}) => {
    console.log('🚀 ~ clientSecret:', clientSecret)
    return clientSecret
  }
}

export default CreatePaymentIntentSuccess
