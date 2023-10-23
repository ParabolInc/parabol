import {SendCustomPromptSuccessResolvers} from '../resolverTypes'

export type SendCustomPromptSuccessSource = {
  response: string
}

const SendCustomPromptSuccess: SendCustomPromptSuccessResolvers = {
  response: async ({response}, _args, {dataLoader}) => {
    console.log('🚀 ~ response:', response)
    return response
  }
}

export default SendCustomPromptSuccess
