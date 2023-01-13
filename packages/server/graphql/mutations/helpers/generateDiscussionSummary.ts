import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import updateDiscussions from '../../../postgres/queries/updateDiscussions'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import canAccessAISummary from './canAccessAISummary'

const generateDiscussionSummary = async (
  discussionId: string,
  meeting: MeetingRetrospective,
  dataLoader: DataLoaderWorker
) => {
  const {id: meetingId, endedAt, facilitatorUserId, teamId} = meeting
  const [facilitator, comments, tasks, team] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('commentsByDiscussionId').load(discussionId),
    dataLoader.get('tasksByDiscussionId').load(discussionId),
    dataLoader.get('teams').load(teamId)
  ])
  if (!canAccessAISummary(team, facilitator.featureFlags)) return
  const manager = new OpenAIServerManager()
  const commentsContent = comments
    .filter(({createdBy}) => createdBy !== PARABOL_AI_USER_ID)
    .map(({plaintextContent}) => plaintextContent)
  const tasksContent = tasks.map(({plaintextContent}) => plaintextContent)
  const contentToSummarize = [...commentsContent, ...tasksContent]
  if (contentToSummarize.length <= 1) return
  const summary = await manager.getSummary(contentToSummarize)
  if (!summary) return
  await updateDiscussions({summary}, discussionId)
  // when we end the meeting, we don't wait for the OpenAI response as we want to see the meeting summary immediately, so publish the subscription
  if (endedAt) {
    const operationId = dataLoader.share()
    const subOptions = {operationId}
    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'EndRetrospectiveSuccess', data, subOptions)
  }
}

export default generateDiscussionSummary
