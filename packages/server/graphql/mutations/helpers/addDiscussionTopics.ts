import mapGroupsToStages from 'parabol-client/utils/makeGroupsToStages'
import DiscussStage from '../../../database/types/DiscussStage'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import generateUID from '../../../generateUID'
import {DataLoaderWorker} from '../../graphql'

const addDiscussionTopics = async (meeting: MeetingRetrospective, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, phases} = meeting
  const discussPhase = phases.find((phase) => phase.phaseType === 'discuss')
  if (!discussPhase) return {discussPhaseStages: [], meetingId}
  const placeholderStage = discussPhase.stages[0]
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
  })
  const firstDiscussStage = nextDiscussStages[0]
  if (!firstDiscussStage || !placeholderStage) return {discussPhaseStages: [], meetingId}

  // MUTATIVE
  discussPhase.stages = nextDiscussStages
  return {meetingId, discussPhaseStages: nextDiscussStages}
}

export default addDiscussionTopics
