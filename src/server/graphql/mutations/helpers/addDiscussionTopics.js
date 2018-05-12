// @flow
import shortid from 'shortid'
import {DISCUSS} from 'universal/utils/constants'

export const makeDiscussionStage = (
  reflectionGroupId: string,
  meetingId: string,
  placeholderId: ?string
) => ({
  id: placeholderId || shortid.generate(),
  meetingId,
  isComplete: false,
  isNavigable: true,
  isNavigableByFacilitator: true,
  phaseType: DISCUSS,
  reflectionGroupId,
  startAt: placeholderId ? new Date() : undefined,
  viewCount: placeholderId ? 1 : 0
})

const mapGroupsToStages = (reflectionGroups) => {
  const importantReflectionGroups = reflectionGroups.filter((group) => group.voterIds.length > 0)
  // handle edge case that no one votes
  if (importantReflectionGroups.length === 0) return reflectionGroups
  importantReflectionGroups.sort((a, b) => (a.voterIds.length < b.voterIds.length ? 1 : -1))
  return importantReflectionGroups
}

const addDiscussionTopics = async (meeting: Object, dataLoader: Object): Object => {
  const {id: meetingId, phases} = meeting
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)
  if (!discussPhase) return {}
  const placeholderStage = discussPhase.stages[0]
  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const importantReflectionGroups = mapGroupsToStages(reflectionGroups)
  const nextDiscussStages = importantReflectionGroups.map((reflectionGroup, idx) => {
    const placeholderId = idx === 0 ? placeholderStage.id : undefined
    return makeDiscussionStage(reflectionGroup.id, meetingId, placeholderId)
  })
  const firstDiscussStage = nextDiscussStages[0]
  if (!firstDiscussStage || !placeholderStage) return {}

  // MUTATIVE
  discussPhase.stages = nextDiscussStages
  return {meetingId, discussPhaseStages: nextDiscussStages}
}

export default addDiscussionTopics
