import {CreateSetupIntentSuccessResolvers} from '../resolverTypes'

export type CreateSetupIntentSuccessSource = {
  clientSecret: string
}

const CreateSetupIntentSuccess: CreateSetupIntentSuccessResolvers = {
  clientSecret: async ({clientSecret}) => clientSecret
}

export default CreateSetupIntentSuccess
