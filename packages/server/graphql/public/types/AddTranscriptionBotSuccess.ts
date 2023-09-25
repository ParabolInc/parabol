import {AddTranscriptionBotSuccessResolvers} from '../resolverTypes'

export type AddTranscriptionBotSuccessSource = {
  success: boolean
}

const AddTranscriptionBotSuccess: AddTranscriptionBotSuccessResolvers = {
  success: async ({success}) => success
}

export default AddTranscriptionBotSuccess
