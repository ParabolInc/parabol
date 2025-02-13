import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {QueryResolvers} from '../resolverTypes'

const getDemoGroupTitle: QueryResolvers['getDemoGroupTitle'] = async (_source, {reflections}) => {
  const manager = new OpenAIServerManager()

  try {
    const formattedReflections = reflections.map((text) => ({plaintextContent: text}))
    const title = await manager.generateGroupTitle(formattedReflections)
    return {title}
  } catch (e) {
    // If OpenAI fails, fall back to using the first reflection as the title
    const fallbackTitle = reflections[0] || 'Untitled Group'
    return {title: fallbackTitle}
  }
}

export default getDemoGroupTitle
