import {
  AUTO_GROUPING_THRESHOLD,
  GROUP,
  REFLECT,
  RETROSPECTIVE,
  VOTE
} from 'parabol-client/utils/constants'
import addDiscussionTopics from './addDiscussionTopics'
import removeEmptyReflections from './removeEmptyReflections'
import Meeting from '../../../database/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import groupReflections from '../../../../client/utils/smartGroup/groupReflections'
import getRethink from '../../../database/rethinkDriver'

/*
 * handle side effects when a stage is completed
 * returns an object if the side effect is necessary before the navigation is complete
 * otherwise, returns an empty object
 */
const handleCompletedRetrospectiveStage = async (
  stage: GenericMeetingStage,
  meeting: Meeting,
  dataLoader: DataLoaderWorker
) => {
  if (stage.phaseType === REFLECT || stage.phaseType === GROUP) {
    const data: Record<string, any> = await removeEmptyReflections(meeting)

    if (stage.phaseType === REFLECT) {
      const r = await getRethink()
      const now = new Date()
      const reflectionGroups = await dataLoader
        .get('retroReflectionGroupsByMeetingId')
        .load(meeting.id)
      const reflections = await r
        .table('RetroReflection')
        .getAll(meeting.id, {index: 'meetingId'})
        .filter({isActive: true})
        .orderBy('createdAt')
        .run()
      const {reflectionGroupMapping, autoGroupThreshold, nextThresh} = groupReflections(
        reflections,
        AUTO_GROUPING_THRESHOLD
      )
      console.log(`autoGroupThreshold = ${autoGroupThreshold}; nextThresh = ${nextThresh}`)

      reflectionGroups.sort((groupA, groupB) => {
        const newGroupIdA = reflectionGroupMapping[groupA.id]
        const newGroupIdB = reflectionGroupMapping[groupB.id]
        return newGroupIdA.localeCompare(newGroupIdB)
      })

      reflectionGroups.forEach(async (group, index) => {
        group.sortOrder = index
        await r
          .table('RetroReflectionGroup')
          .get(group.id)
          .update({
            sortOrder: index,
            updatedAt: now
          } as any)
          .run()
      })

      data.reflectionGroups = reflectionGroups
    }

    return {[stage.phaseType]: data}
  } else if (stage.phaseType === VOTE) {
    // mutates the meeting discuss phase.stages array
    const data = await addDiscussionTopics(meeting, dataLoader)
    return {[VOTE]: data}
  }
  return {}
}

const handleCompletedStage = async (
  stage: GenericMeetingStage,
  meeting: Meeting,
  dataLoader: DataLoaderWorker
) => {
  if (meeting.meetingType === RETROSPECTIVE) {
    return handleCompletedRetrospectiveStage(stage, meeting, dataLoader)
  }
  return {}
}

export default handleCompletedStage
