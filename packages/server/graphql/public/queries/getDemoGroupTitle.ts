import {getSimpleGroupTitle} from '../../../../client/utils/getSimpleGroupTitle'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {QueryResolvers} from '../resolverTypes'

const getDemoGroupTitle: QueryResolvers['getDemoGroupTitle'] = async (
  _source,
  {reflectionsContent}
) => {
  const manager = new OpenAIServerManager()

  const reflections = reflectionsContent.map((content) => ({plaintextContent: content}))
  try {
    const title = await manager.generateGroupTitle(reflections)
    return {title}
  } catch (e) {
    // If OpenAI fails, fall back to using the first reflection as the title
    const fallbackTitle = getSimpleGroupTitle(reflections)
    return {title: fallbackTitle}
  }
}

export default getDemoGroupTitle
