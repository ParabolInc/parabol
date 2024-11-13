import {PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAI from './canAccessAI'

const generateWholeMeetingSummary = async (
  discussionIds: string[],
  meetingId: string,
  teamId: string,
  facilitatorUserId: string,
  dataLoader: DataLoaderWorker
) => {
  const [facilitator, team] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  const isAIAvailable = await canAccessAI(team, 'retrospective', dataLoader)
  if (!isAIAvailable) return
  const [commentsByDiscussions, tasksByDiscussions, reflections] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').loadMany(discussionIds),
    dataLoader.get('tasksByDiscussionId').loadMany(discussionIds),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const manager = new OpenAIServerManager()
  const reflectionsContent = reflections.map((reflection) => reflection.plaintextContent)
  const commentsContent = commentsByDiscussions
    .filter(isValid)
    .flatMap((commentsByDiscussion) =>
      commentsByDiscussion
        .filter(({createdBy}) => createdBy !== PARABOL_AI_USER_ID)
        .map(({plaintextContent}) => plaintextContent)
    )
  const tasksContent = tasksByDiscussions
    .filter(isValid)
    .flatMap((tasksByDiscussion) => tasksByDiscussion.map(({plaintextContent}) => plaintextContent))
  const contentToSummarize = [...commentsContent, ...tasksContent, ...reflectionsContent]
  if (contentToSummarize.length <= 1) return
  const summary = await manager.getSummary(contentToSummarize)
  if (!summary) return
  return summary
}

export default generateWholeMeetingSummary
