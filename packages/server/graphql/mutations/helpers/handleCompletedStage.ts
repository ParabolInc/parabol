import {AUTO_GROUPING_THRESHOLD, GROUP, REFLECT, VOTE} from 'parabol-client/utils/constants'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import {r} from 'rethinkdb-ts'
import groupReflections from '../../../../client/utils/smartGroup/groupReflections'
import getRethink from '../../../database/rethinkDriver'
import DiscussStage from '../../../database/types/DiscussStage'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import getKysely from '../../../postgres/getKysely'
import insertDiscussions from '../../../postgres/queries/insertDiscussions'
import {AnyMeeting} from '../../../postgres/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import addAIGeneratedContentToThreads from './addAIGeneratedContentToThreads'
import addDiscussionTopics from './addDiscussionTopics'
import addRecallBot from './addRecallBot'
import generateDiscussionSummary from './generateDiscussionSummary'
import generateGroupSummaries from './generateGroupSummaries'
import generateGroups from './generateGroups'
import {publishToEmbedder} from './publishToEmbedder'
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
      const pg = getKysely()
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
          return Promise.all([
            pg
              .updateTable('RetroReflectionGroup')
              .set({sortOrder: index})
              .where('id', '=', group.id)
              .execute(),
            r
              .table('RetroReflectionGroup')
              .get(group.id)
              .update({
                sortOrder: index,
                updatedAt: now
              } as any)
              .run()
          ])
        })
      )

      data.reflectionGroups = sortedReflectionGroups
      generateGroups(reflections, meeting.teamId, dataLoader)
    } else if (stage.phaseType === GROUP) {
      const {facilitatorUserId, phases, teamId} = meeting
      unlockAllStagesForPhase(phases, 'discuss', true)
      await r
        .table('NewMeeting')
        .get(meeting.id)
        .update({
          phases
        })
        .run()
      data.meeting = meeting
      // dont await for the OpenAI API response
      generateGroupSummaries(meeting.id, teamId, dataLoader, facilitatorUserId)
    }

    return {[stage.phaseType]: data}
  } else if (stage.phaseType === VOTE) {
    // mutates the meeting discuss phase.stages array
    const data = await addDiscussionTopics(meeting, dataLoader)
    // create new threads
    const {discussPhaseStages} = data
    const {id: meetingId, teamId, videoMeetingURL} = meeting

    const discussions = discussPhaseStages.map((stage) => ({
      id: stage.discussionId,
      meetingId,
      teamId,
      discussionTopicType: 'reflectionGroup' as const,
      discussionTopicId: stage.reflectionGroupId
    }))
    await Promise.all([
      insertDiscussions(discussions),
      addAIGeneratedContentToThreads(discussPhaseStages, meetingId, dataLoader),
      publishToEmbedder({jobType: 'relatedDiscussions:start', data: {meetingId}, priority: 0})
    ])
    if (videoMeetingURL) {
      addRecallBot(meetingId, videoMeetingURL)
    }
    return {[VOTE]: data}
  } else if (stage.phaseType === 'discuss') {
    const {discussionId} = stage as DiscussStage
    // don't await for the OpenAI API response
    generateDiscussionSummary(discussionId, meeting, dataLoader)
  }
  return {}
}

const handleCompletedStage = async (
  stage: GenericMeetingStage,
  meeting: AnyMeeting,
  dataLoader: DataLoaderWorker
) => {
  if (meeting.meetingType === 'retrospective') {
    return handleCompletedRetrospectiveStage(stage, meeting as MeetingRetrospective, dataLoader)
  }
  return {}
}

export default handleCompletedStage
