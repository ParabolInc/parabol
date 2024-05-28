import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import Reflection from '../../../database/types/Reflection'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'

const generateReflectionGroupTitle = async (reflections: Reflection[]) => {
  const openAI = new OpenAIServerManager()
  const generatedReflectionGroupTitle = await openAI.getReflectionGroupTitle(reflections)
  if (!generatedReflectionGroupTitle) {
    return getGroupSmartTitle(reflections)
  }
  return generatedReflectionGroupTitle
}

export default generateReflectionGroupTitle
