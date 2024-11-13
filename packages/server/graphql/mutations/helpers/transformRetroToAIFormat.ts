import {getKysely} from '../../../postgres/kysely'
import {RetrospectiveMeeting} from '../../../postgres/types'
import {getPhase} from '../../../utils/meetings/getPhase'
import {DataLoaderWorker} from '../../graphql'

type MeetingContent = {
  voteCount: number
  title: string
  comments?: {
    text: string
    author: string
    replies?: {text: string; author: string}[]
  }[]
  reflections: {
    prompt: string
    author: string
    text: string
    discussionId: number
  }[]
  meetingName: string
  date: string
  meetingId: string
  discussionId: number
}

const getComments = async (reflectionGroupId: string, dataLoader: DataLoaderWorker) => {
  const IGNORE_COMMENT_USER_IDS = ['parabolAIUser']
  const discussion = await getKysely()
    .selectFrom('Discussion')
    .selectAll()
    .where('discussionTopicId', '=', reflectionGroupId)
    .limit(1)
    .executeTakeFirst()
  if (!discussion) return null
  const {id: discussionId} = discussion
  const rawComments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
  const humanComments = rawComments.filter((c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy!))
  const rootComments = humanComments.filter((c) => !c.threadParentId)
  rootComments.sort((a, b) => (a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1))

  const comments = await Promise.all(
    rootComments.map(async (comment) => {
      const {createdBy, isAnonymous, plaintextContent} = comment
      const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
      const commentAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
      const commentReplies = await Promise.all(
        humanComments
          .filter((c) => c.threadParentId === comment.id)
          .sort((a, b) => (a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1))
          .map(async (reply) => {
            const {createdBy, isAnonymous, plaintextContent} = reply
            const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
            const replyAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
            return {text: plaintextContent, author: replyAuthor}
          })
      )
      return {text: plaintextContent, author: commentAuthor, replies: commentReplies}
    })
  )
  return comments
}

export const transformMeetingToAIFormat = async (
  meeting: RetrospectiveMeeting,
  dataLoader: DataLoaderWorker
): Promise<MeetingContent[] | null> => {
  const {id: meetingId, disableAnonymity, name: meetingName, createdAt: meetingDate} = meeting
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
          getKysely()
            .selectFrom('Discussion')
            .selectAll()
            .where('discussionTopicId', '=', reflectionGroupId)
            .limit(1)
            .executeTakeFirst()
        ])

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
              dataLoader.get('reflectPrompts').loadNonNull(promptId),
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

        const shortMeetingDate = new Date(meetingDate).toISOString().split('T')[0]
        const content: MeetingContent = {
          voteCount: voterIds.length,
          title,
          comments,
          reflections,
          meetingName,
          date: shortMeetingDate,
          meetingId,
          discussionId: discussionIdx
        }

        if (!content.comments?.length) {
          delete content.comments
        }
        return content
      })
  )

  return reflectionGroups
}
