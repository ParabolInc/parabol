import mapGroupsToStages from 'parabol-client/utils/makeGroupsToStages'
import DiscussStage from '../../../database/types/DiscussStage'
import generateUID from '../../../generateUID'
import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import getPhase from '../../../utils/getPhase'
import {DataLoaderWorker} from '../../graphql'

const addDiscussionTopics = async (meeting: RetrospectiveMeeting, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, phases} = meeting
  const discussPhase = getPhase(phases, 'discuss')
  if (!discussPhase) return {discussPhaseStages: [], meetingId}
  const placeholderStage = discussPhase.stages[0]
  if (!placeholderStage) return {discussPhaseStages: [], meetingId}

  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)

  const sortedReflectionGroups = mapGroupsToStages(reflectionGroups)
  const nextDiscussStages = sortedReflectionGroups.map((reflectionGroup, idx) => {
    const {id: reflectionGroupId} = reflectionGroup
    const id = idx === 0 ? placeholderStage.id : generateUID()
    return new DiscussStage({
      id,
      isNavigableByFacilitator: true,
      isNavigable: true,
      reflectionGroupId,
      sortOrder: idx,
      startAt: idx === 0 ? new Date() : undefined,
      viewCount: idx === 0 ? 1 : 0,
      durations: undefined
    })
  }) as [DiscussStage, ...DiscussStage[]]
  const firstDiscussStage = nextDiscussStages[0]
  if (!firstDiscussStage) return {discussPhaseStages: [], meetingId}

  // MUTATIVE
  discussPhase.stages = nextDiscussStages
  return {meetingId, discussPhaseStages: nextDiscussStages}
}

export default addDiscussionTopics
