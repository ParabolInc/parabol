import getKysely from '../../../postgres/getKysely'
import type {AnyMeeting} from '../../../postgres/types/Meeting'
import getPhase from '../../../utils/getPhase'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import calculateEngagement from './calculateEngagement'
import collectReactjis from './collectReactjis'

const gatherInsights = async (meeting: AnyMeeting, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const {id: meetingId, phases} = meeting
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const discussionIds = stages.map((stage) => stage.discussionId)

  const [usedReactjis, engagement, reflectionGroups, reflections] = await Promise.all([
    collectReactjis(meeting, dataLoader),
    calculateEngagement(meeting, dataLoader),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const reflectionGroupIds = reflectionGroups.map(({id}) => id)
  const commentCounts = (
    await dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds)
  ).filter(isValid)
  const commentCount = commentCounts.reduce((cumSum, count) => cumSum + count, 0)
  const taskCountRes = await pg
    .selectFrom('Task')
    .select(({fn}) => fn.count<bigint>('id').as('count'))
    .where('discussionId', 'in', discussionIds)
    .executeTakeFirst()
  return {
    usedReactjis,
    engagement,
    commentCount,
    reflectionCount: reflections.length,
    taskCount: Number(taskCountRes?.count ?? 0),
    topicCount: reflectionGroupIds.length
  }
}

export default gatherInsights
