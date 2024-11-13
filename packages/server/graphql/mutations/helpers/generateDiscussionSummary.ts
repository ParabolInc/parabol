import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import updateDiscussions from '../../../postgres/queries/updateDiscussions'
import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const generateDiscussionSummary = async (
  discussionId: string,
  meeting: RetrospectiveMeeting,
  dataLoader: DataLoaderWorker
) => {
  const {id: meetingId, endedAt, teamId} = meeting
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const isAIAvailable = await canAccessAI(team, 'retrospective', dataLoader)
  if (!isAIAvailable) return
  const [comments, tasks] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').load(discussionId),
    dataLoader.get('tasksByDiscussionId').load(discussionId)
  ])
  const manager = new OpenAIServerManager()
  const commentsContent = comments
    .filter(({createdBy}) => createdBy !== PARABOL_AI_USER_ID)
    .map(({plaintextContent}) => plaintextContent)
  const tasksContent = tasks.map(({plaintextContent}) => plaintextContent)
  const contentToSummarize = [...commentsContent, ...tasksContent]
  if (contentToSummarize.length <= 1) return
  const summary = await manager.getSummary(contentToSummarize, 'discussion thread')
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
