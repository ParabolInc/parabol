import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import Reflection from '../../../database/types/Reflection'
import {Team} from '../../../postgres/queries/getTeamsByIds'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const generateReflectionGroupTitle = async (team: Team, reflections: Reflection[]) => {
  if (getFeatureTier(team) === 'starter' || reflections.length === 1) {
    return getGroupSmartTitle(reflections)
  }
  const openAI = new OpenAIServerManager()
  const generatedReflectionGroupTitle = await openAI.getReflectionGroupTitle(reflections)
  if (!generatedReflectionGroupTitle) {
    return getGroupSmartTitle(reflections)
  }
  return generatedReflectionGroupTitle
}

export default generateReflectionGroupTitle
