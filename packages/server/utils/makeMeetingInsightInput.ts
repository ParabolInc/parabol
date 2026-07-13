import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import isValid from '../graphql/isValid'
import {getComments} from '../graphql/public/mutations/helpers/getComments'
import {resolveStoryFinalScore} from '../graphql/resolvers/resolveStoryFinalScore'
import type {RetroReflection} from '../postgres/types'
import type {
  AnyMeeting,
  PokerMeeting,
  RetrospectiveMeeting,
  TeamHealthMeeting,
  TeamPromptMeeting
} from '../postgres/types/Meeting'
import getPhase from './getPhase'
import {Logger} from './Logger'

const serializeReflections = async (
  rawReflections: RetroReflection[],
  disableAnonymity: boolean,
  dataLoader: DataLoaderInstance
) => {
  return Promise.all(
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
}

const serializeTasks = async (
  discussionId: string | null | undefined,
  dataLoader: DataLoaderInstance
) => {
  if (!discussionId) return []
  const tasks = await dataLoader.get('tasksByDiscussionId').load(discussionId)
  if (!tasks.length) return []
  return Promise.all(
    tasks.map(async (task) => {
      const {createdBy, plaintextContent} = task
      const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
      const taskAuthor = creator ? creator.preferredName : 'Anonymous'
      return {
        text: plaintextContent,
        author: taskAuthor
      }
    })
  )
}
export const makeRetroMeetingInsightInput = async (
  meeting: RetrospectiveMeeting,
  dataLoader: DataLoaderInstance,
  minReflectionCount = 3,
  attemptedMinReflectionGroupVotes = 2
) => {
  const {id: meetingId, meetingType, reflectionCount, disableAnonymity, phases} = meeting
  if (!reflectionCount || reflectionCount < minReflectionCount) return null
  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const votedReflectionGroups = reflectionGroups.filter(
    (group) => group.voterIds.length >= attemptedMinReflectionGroupVotes
  )
  // if the vote filter removed all the items, ignore it. This is because some teams do not vote
  const meaningfulReflectionGroups =
    votedReflectionGroups.length === 0 ? reflectionGroups : votedReflectionGroups
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const topics = await Promise.all(
    meaningfulReflectionGroups.map(async (group) => {
      const {id: reflectionGroupId, voterIds, title} = group
      const [rawReflections, discussion] = await Promise.all([
        dataLoader.get('retroReflectionsByGroupId').load(group.id),
        dataLoader.get('discussions').load(group.id)
      ])

      const [comments, reflections, tasks] = await Promise.all([
        getComments(reflectionGroupId, dataLoader),
        serializeReflections(rawReflections, disableAnonymity, dataLoader),
        serializeTasks(discussion?.id, dataLoader)
      ])

      const res = {
        voteCount: voterIds.length,
        title: title,
        comments,
        reflections,
        tasks,
        stageNumber: stages.findIndex((stage) => stage.reflectionGroupId === reflectionGroupId) + 1
      }
      return res
    })
  )
  return {
    meetingType,
    topics: topics.sort((a, b) => (a.voteCount > b.voteCount ? -1 : 1))
  }
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

const makeTeamHealthMeetingInsightInput = async (
  meeting: TeamHealthMeeting,
  dataLoader: DataLoaderInstance
) => {
  // require enough distinct respondents that no answer can be traced back to an individual
  const MIN_RESPONSES = 3
  const {id: meetingId, meetingType} = meeting
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  const responderCount = new Set(responses.map(({userId}) => userId)).size
  if (responderCount < MIN_RESPONSES) return null

  const questionIds = [...new Set(responses.map(({questionId}) => String(questionId)))]
  const questions = (await dataLoader.get('teamHealthQuestions').loadMany(questionIds)).filter(
    isValid
  )
  const questionById = new Map(questions.map((question) => [String(question.id), question]))

  // group responses by question, dropping any user linkage so the data stays anonymous
  const grouped = new Map<string, {question: string; scores: number[]; comments: string[]}>()
  for (const response of responses) {
    const questionId = String(response.questionId)
    const question = questionById.get(questionId)
    if (!question) continue
    let entry = grouped.get(questionId)
    if (!entry) {
      entry = {question: question.question, scores: [], comments: []}
      grouped.set(questionId, entry)
    }
    if (response.score !== null && response.score !== undefined) entry.scores.push(response.score)
    if (response.comment) entry.comments.push(response.comment)
  }
  return {meetingType, questions: [...grouped.values()]}
}

const makePokerMeetingInsightInput = async (
  meeting: PokerMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {id: meetingId, phases, meetingType} = meeting
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const allStories = await Promise.all(
    stages.map(async (stage) => {
      const {serviceTaskId, taskId, dimensionRefIdx} = stage
      const finalScore = await resolveStoryFinalScore(
        taskId,
        meetingId,
        dimensionRefIdx,
        dataLoader
      )
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

const makeMeetingInsightPart = async (meeting: AnyMeeting, dataLoader: DataLoaderInstance) => {
  const {meetingType} = meeting
  switch (meetingType) {
    case 'action':
      return null
    case 'teamHealth':
      return makeTeamHealthMeetingInsightInput(meeting, dataLoader)
    case 'poker':
      return makePokerMeetingInsightInput(meeting, dataLoader)
    case 'retrospective':
      return makeRetroMeetingInsightInput(meeting, dataLoader)
    case 'teamPrompt':
      return makeTeamPromptMeetingInsightInput(meeting, dataLoader)
  }
}

export const makeMeetingInsightInput = async (
  meeting: AnyMeeting,
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
