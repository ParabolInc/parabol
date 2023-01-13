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
  const [facilitator, commentsByDiscussions, tasksByDiscussions, reflections, team] =
    await Promise.all([
      dataLoader.get('users').loadNonNull(facilitatorUserId),
      dataLoader.get('commentsByDiscussionId').loadMany(discussionIds),
      dataLoader.get('tasksByDiscussionId').loadMany(discussionIds),
      dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
      dataLoader.get('teams').load(teamId)
    ])
  if (!canAccessAISummary(team, facilitator.featureFlags)) return
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
  const [meeting] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    r.table('NewMeeting').get(meetingId).update({summary}).run()
  ])
  // mutate the cache
  meeting.summary = summary
}

export default generateWholeMeetingSummary
