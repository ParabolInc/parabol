import {PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAISummary from './canAccessAISummary'

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
  if (!canAccessAISummary(team, facilitator.featureFlags)) return
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
  const [r, summary] = await Promise.all([getRethink(), manager.getSummary(contentToSummarize)])
  if (!summary) return
  await Promise.all([
    dataLoader.get('newMeetings').updateCache(meetingId, {summary}),
    r.table('NewMeeting').get(meetingId).update({summary}).run()
  ])
}

export default generateWholeMeetingSummary
