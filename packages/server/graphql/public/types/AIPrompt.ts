import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {AiPromptResolvers} from '../resolverTypes'

const AIPrompt: AiPromptResolvers = {
  id: ({id}) => CipherId.toClient(id, 'AIPrompt'),
  isUserDefined: ({userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return userId === viewerId
  }
}

export default AIPrompt
