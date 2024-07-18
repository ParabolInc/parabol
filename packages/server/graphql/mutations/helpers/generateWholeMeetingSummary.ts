import {PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'

const generateWholeMeetingSummary = async (
  discussionIds: string[],
  meetingId: string,
  teamId: string,
  facilitatorUserId: string,
  dataLoader: DataLoaderWorker
) => {
  console.log('🚀 ~ discussionIds:', {dataLoader})
  // const [facilitator, team] = await Promise.all([
  //   dataLoader.get('users').loadNonNull(facilitatorUserId),
  //   dataLoader.get('teams').loadNonNull(teamId)
  // ])
  // console.log('heee', {facilitator, team})
  // const isAISummaryAccessible = await canAccessAISummary(
  //   team,
  //   facilitator.featureFlags,
  //   dataLoader,
  //   'retrospective'
  // )
  // console.log('🚀 ~ isAISummaryAccessible:', isAISummaryAccessible)
  // if (!isAISummaryAccessible) return
  const [commentsByDiscussions, tasksByDiscussions, reflections] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').loadMany(discussionIds),
    dataLoader.get('tasksByDiscussionId').loadMany(discussionIds),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  console.log('🚀 ~ commentsByDiscussions:', commentsByDiscussions)
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
