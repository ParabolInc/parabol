import updateDiscussions from '../../../postgres/queries/updateDiscussions'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const generateDiscussionSummary = async (
  discussionId: string,
  facilitatorUserId: string,
  dataLoader: DataLoaderWorker
) => {
  const [facilitator, comments, tasks] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('commentsByDiscussionId').load(discussionId),
    dataLoader.get('tasksByDiscussionId').load(discussionId)
  ])
  if (!facilitator.featureFlags.includes('aiSummary')) return
  const manager = new OpenAIServerManager()
  const commentsContent = comments.map((comment) => comment.plaintextContent)
  const tasksContent = tasks.map((task) => task.plaintextContent)
  const summary = await manager.getSummary([...commentsContent, ...tasksContent])
  await updateDiscussions({summary}, discussionId)
}

export default generateDiscussionSummary
