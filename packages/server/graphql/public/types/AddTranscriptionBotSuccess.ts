import {AddTranscriptionBotSuccessResolvers} from '../resolverTypes'

export type AddTranscriptionBotSuccessSource = {
  success: boolean
}

const AddTranscriptionBotSuccess: AddTranscriptionBotSuccessResolvers = {
  success: (source) => source.success
}

export default AddTranscriptionBotSuccess
