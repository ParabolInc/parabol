import {AUTO_GROUPING_THRESHOLD, GROUP, REFLECT, VOTE} from 'parabol-client/utils/constants'
import groupReflections from '../../../../client/utils/smartGroup/groupReflections'
import getRethink from '../../../database/rethinkDriver'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import MeetingAction from '../../../database/types/MeetingAction'
import MeetingPoker from '../../../database/types/MeetingPoker'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import insertDiscussions from '../../../postgres/queries/insertDiscussions'
import {DataLoaderWorker} from '../../graphql'
import addDiscussionTopics from './addDiscussionTopics'
import removeEmptyReflections from './removeEmptyReflections'

/*
 * handle side effects when a stage is completed
 * returns an object if the side effect is necessary before the navigation is complete
 * otherwise, returns an empty object
 */
const handleCompletedRetrospectiveStage = async (
  stage: GenericMeetingStage,
  meeting: MeetingRetrospective,
  dataLoader: DataLoaderWorker
) => {
  if (stage.phaseType === REFLECT || stage.phaseType === GROUP) {
    const data: Record<string, any> = await removeEmptyReflections(meeting)

    if (stage.phaseType === REFLECT) {
      const r = await getRethink()
      const now = new Date()

      const [reflectionGroups, reflections] = await Promise.all([
        dataLoader.get('retroReflectionGroupsByMeetingId').load(meeting.id),
        r
          .table('RetroReflection')
          .getAll(meeting.id, {index: 'meetingId'})
          .filter({isActive: true})
          .orderBy('createdAt')
          .run()
      ])

      const {reflectionGroupMapping} = groupReflections(reflections.slice(), {
        groupingThreshold: AUTO_GROUPING_THRESHOLD
      })

      const sortedReflectionGroups = reflectionGroups.slice().sort((groupA, groupB) => {
        const newGroupIdA = reflectionGroupMapping[groupA.id]!
        const newGroupIdB = reflectionGroupMapping[groupB.id]!
        return newGroupIdA < newGroupIdB ? -1 : 1
      })

      await Promise.all(
        sortedReflectionGroups.map((group, index) => {
          group.sortOrder = index
          r.table('RetroReflectionGroup')
            .get(group.id)
            .update({
              sortOrder: index,
              updatedAt: now
            } as any)
            .run()
        })
      )

      data.reflectionGroups = sortedReflectionGroups
    }

    return {[stage.phaseType]: data}
  } else if (stage.phaseType === VOTE) {
    // mutates the meeting discuss phase.stages array
    const data = await addDiscussionTopics(meeting, dataLoader)
    // create new threads
    const {discussPhaseStages} = data
    const {id: meetingId, teamId} = meeting
    const discussions = discussPhaseStages.map((stage) => ({
      id: stage.discussionId,
      meetingId,
      teamId,
      discussionTopicType: 'reflectionGroup' as const,
      discussionTopicId: stage.reflectionGroupId
    }))
    await insertDiscussions(discussions)
    return {[VOTE]: data}
  }
  return {}
}

const handleCompletedStage = async (
  stage: GenericMeetingStage,
  meeting: MeetingRetrospective | MeetingPoker | MeetingAction | MeetingTeamPrompt,
  dataLoader: DataLoaderWorker
) => {
  if (meeting.meetingType === 'retrospective') {
    return handleCompletedRetrospectiveStage(stage, meeting as MeetingRetrospective, dataLoader)
  }
  return {}
}

export default handleCompletedStage
