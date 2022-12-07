import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'

const generateWholeMeetingSummary = async (
  discussionIds: string[],
  meetingId: string,
  facilitatorUserId: string,
  dataLoader: DataLoaderWorker
) => {
  const [facilitator, commentsByDiscussions, tasksByDiscussions, reflections] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('commentsByDiscussionId').loadMany(discussionIds),
    dataLoader.get('tasksByDiscussionId').loadMany(discussionIds),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  if (!facilitator.featureFlags.includes('aiSummary')) return
  const manager = new OpenAIServerManager()
  const reflectionsContent = reflections.map((reflection) => reflection.plaintextContent)
  const commentsContent = commentsByDiscussions
    .filter(isValid)
    .flatMap((commentsByDiscussion) =>
      commentsByDiscussion.map(({plaintextContent}) => plaintextContent)
    )
  const tasksContent = tasksByDiscussions
    .filter(isValid)
    .flatMap((tasksByDiscussion) => tasksByDiscussion.map(({plaintextContent}) => plaintextContent))
  console.log('🚀 ~ commentsContent', commentsContent)
  const contentToSummarize = [...commentsContent, ...tasksContent, ...reflectionsContent]
  console.log('🚀 ~ contentToSummarize', contentToSummarize)
  if (contentToSummarize.length <= 1) return
  const summary = await manager.getSummary(contentToSummarize)
  console.log('🚀 ~ summary', summary)
}

export default generateWholeMeetingSummary
