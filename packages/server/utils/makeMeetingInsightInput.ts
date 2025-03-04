import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import isValid from '../graphql/isValid'
import {getComments} from '../graphql/public/mutations/helpers/getTopics'
import type {NewMeeting} from '../postgres/types'
import type {PokerMeeting, RetrospectiveMeeting, TeamPromptMeeting} from '../postgres/types/Meeting'
import getPhase from './getPhase'
import {Logger} from './Logger'

const makeRetroMeetingInsightInput = async (
  meeting: RetrospectiveMeeting,
  dataLoader: DataLoaderInstance
) => {
  const MIN_REFLECTION_COUNT = 3
  const MIN_REFLECTION_GROUP_VOTES = 2
  const {id: meetingId, meetingType, reflectionCount, disableAnonymity} = meeting
  if (!reflectionCount || reflectionCount < MIN_REFLECTION_COUNT) return null
  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const votedReflectionGroups = reflectionGroups.filter(
    (group) => group.voterIds.length >= MIN_REFLECTION_GROUP_VOTES
  )
  const topics = await Promise.all(
    votedReflectionGroups.map(async (group) => {
      const {id: reflectionGroupId, voterIds, title} = group
      const [comments, rawReflections] = await Promise.all([
        getComments(reflectionGroupId, dataLoader),
        dataLoader.get('retroReflectionsByGroupId').load(group.id)
      ])
      const reflections = await Promise.all(
        rawReflections.map(async (reflection) => {
          const {promptId, creatorId, plaintextContent} = reflection
          const [prompt, creator] = await Promise.all([
            dataLoader.get('reflectPrompts').loadNonNull(promptId),
            creatorId ? dataLoader.get('users').loadNonNull(creatorId) : null
          ])
          const {question} = prompt
          const creatorName = disableAnonymity && creator ? creator.preferredName : 'Anonymous'
          return {
            prompt: question,
            author: creatorName,
            text: plaintextContent
          }
        })
      )
      const res = {
        voteCount: voterIds.length,
        title: title,
        comments,
        reflections
      }

      if (!res.comments || !res.comments.length) {
        delete (res as any).comments
      }
      return res
    })
  )
  return {meetingType, topics: topics.sort((a, b) => (a.voteCount > b.voteCount ? -1 : 1))}
}

const makeTeamPromptMeetingInsightInput = async (
  meeting: TeamPromptMeeting,
  dataLoader: DataLoaderInstance
) => {
  const MIN_RESPONSES = 2
  const {id: meetingId, meetingType} = meeting
  const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
  if (responses.length < MIN_RESPONSES) return null
  const userIds = responses.map(({userId}) => userId)
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)

  const contentWithUsers = responses.map((response) => ({
    content: response.plaintextContent,
    user: users.find((user) => user.id === response.userId)?.preferredName ?? 'Anonymous'
  }))
  return {meetingType, responses: contentWithUsers}
}

const makePokerMeetingInsightInput = async (
  meeting: PokerMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {phases, meetingType} = meeting
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const allStories = await Promise.all(
    stages.map(async (stage) => {
      const {finalScore, serviceTaskId} = stage
      if (finalScore === null || finalScore === undefined) return null
      const tasks = await dataLoader.get('tasksByIntegrationHash').load(serviceTaskId)
      if (tasks.length !== 1) {
        Logger.log(
          `Poker insights yielded ${tasks.length} tasks for integrationHash: ${serviceTaskId}`
        )
        return null
      }
      const task = tasks[0]!
      const {plaintextContent} = task
      return {
        score: finalScore,
        content: plaintextContent
      }
    })
  )
  const stories = allStories.filter(isValid)
  return {meetingType, stories}
}

const makeMeetingInsightPart = async (meeting: NewMeeting, dataLoader: DataLoaderInstance) => {
  const {meetingType} = meeting
  switch (meetingType) {
    case 'action':
      return null
    case 'poker':
      return makePokerMeetingInsightInput(meeting, dataLoader)
    case 'retrospective':
      return makeRetroMeetingInsightInput(meeting, dataLoader)
    case 'teamPrompt':
      return makeTeamPromptMeetingInsightInput(meeting, dataLoader)
  }
}

export const makeMeetingInsightInput = async (
  meeting: NewMeeting,
  dataLoader: DataLoaderInstance
) => {
  const MIN_MEETING_MEMBERS = 2
  const MIN_DURATION = 60_000
  const {id: meetingId, endedAt, createdAt, name: meetingName} = meeting
  if (!endedAt) return null
  const duration = endedAt.getTime() - createdAt.getTime()
  if (duration < MIN_DURATION) return null
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  if (meetingMembers.length < MIN_MEETING_MEMBERS) return null
  const partial = await makeMeetingInsightPart(meeting, dataLoader)
  if (!partial) return null
  const meetingDate = new Date(createdAt).toISOString().split('T')[0]!
  return {
    ...partial,
    meetingDate,
    meetingName
  }
}
