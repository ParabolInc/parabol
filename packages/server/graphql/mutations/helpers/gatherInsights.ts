import Meeting from '../../../database/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import collectReactjis from './collectReactjis'
import calculateEngagement from './calculateEngagement'

const gatherInsights = async (meeting: Meeting, dataLoader: DataLoaderWorker) => {
  const [usedReactjis, engagement] = await Promise.all([
    collectReactjis(meeting, dataLoader),
    calculateEngagement(meeting, dataLoader)
  ])
  return {usedReactjis, engagement}
}

export default gatherInsights
