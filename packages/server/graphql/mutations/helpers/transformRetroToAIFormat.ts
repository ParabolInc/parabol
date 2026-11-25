import getPhase from '../../../utils/getPhase'
import omitPrivateTasks from '../../../utils/omitPrivateTasks'
import type {DataLoaderWorker} from '../../graphql'
import {getComments} from '../../public/mutations/helpers/getComments'

export const transformRetroToAIFormat = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {disableAnonymity, name: meetingName, createdAt: meetingDate} = meeting
  const rawReflectionGroups = await dataLoader
    .get('retroReflectionGroupsByMeetingId')
    .load(meetingId)

  const reflectionGroups = await Promise.all(
    rawReflectionGroups
      .filter((g) => g.voterIds.length > 1)
      .map(async (group) => {
        const {id: reflectionGroupId, voterIds, title} = group
        const [comments, rawReflections, discussion] = await Promise.all([
          getComments(reflectionGroupId, dataLoader),
          dataLoader.get('retroReflectionsByGroupId').load(group.id),
          dataLoader.get('discussions').load(reflectionGroupId)
        ])

        const tasks = discussion
          ? omitPrivateTasks(await dataLoader.get('tasksByDiscussionId').load(discussion.id))
          : []

        const discussPhase = getPhase(meeting.phases, 'discuss')
        const {stages} = discussPhase
        const stageIdx = stages
          .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
          .findIndex((stage) => stage.discussionId === discussion?.id)
        const discussionIdx = stageIdx + 1

        const reflections = await Promise.all(
          rawReflections.map(async (reflection) => {
            const {promptId, creatorId, plaintextContent} = reflection
            const [prompt, creator] = await Promise.all([
              dataLoader.get('templatePrompts').loadNonNull(promptId),
              creatorId ? dataLoader.get('users').loadNonNull(creatorId) : null
            ])
            const {question} = prompt
            const creatorName = disableAnonymity && creator ? creator.preferredName : 'Anonymous'
            return {
              prompt: question,
              author: creatorName,
              text: plaintextContent,
              discussionId: discussionIdx
            }
          })
        )

        const formattedTasks =
          tasks && tasks.length > 0
            ? await Promise.all(
                tasks.map(async (task) => {
                  const {createdBy, plaintextContent} = task
                  const creator = createdBy
                    ? await dataLoader.get('users').loadNonNull(createdBy)
                    : null
                  const taskAuthor = creator ? creator.preferredName : 'Anonymous'
                  return {
                    text: plaintextContent,
                    author: taskAuthor
                  }
                })
              )
            : undefined

        const shortMeetingDate = new Date(meetingDate).toISOString().split('T')[0]
        const content = {
          voteCount: voterIds.length,
          title,
          comments,
          tasks: formattedTasks,
          reflections,
          meetingName,
          date: shortMeetingDate,
          meetingId,
          discussionId: discussionIdx
        } as {
          comments?: typeof comments
          tasks?: typeof formattedTasks
          [key: string]: any
        }

        if (!content.comments?.length) {
          delete content.comments
        }
        if (!content.tasks?.length) {
          delete content.tasks
        }
        return content
      })
  )

  return reflectionGroups
}
