import {getUserId} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const sendCustomPrompt: MutationResolvers['sendCustomPrompt'] = async (
  _source,
  {prompt},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const manager = new OpenAIServerManager()
  const response = await manager.getCustomResponse(prompt)

  if (!response) {
    const error = new Error('No response from OpenAI')
    return standardError(error)
  }

  const data = {
    response
  }
  return data
}

export default sendCustomPrompt
