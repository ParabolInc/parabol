import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {AiPromptResolvers} from '../resolverTypes'

const AIPrompt: AiPromptResolvers = {
  id: ({id}) => `AIPrompt:${feistelCipher.encrypt(id)}`,
  isUserDefined: ({userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return userId === viewerId
  }
}

export default AIPrompt
