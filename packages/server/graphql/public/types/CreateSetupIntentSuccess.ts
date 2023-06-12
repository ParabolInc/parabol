import {CreateSetupIntentSuccessResolvers} from '../resolverTypes'

export type CreateSetupIntentSuccessSource = {
  success: boolean
}

const CreateSetupIntentSuccess: CreateSetupIntentSuccessResolvers = {
  success: async ({success}) => success
}

export default CreateSetupIntentSuccess
