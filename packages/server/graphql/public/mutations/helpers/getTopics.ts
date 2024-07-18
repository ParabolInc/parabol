import getRethink from '../../../../database/rethinkDriver'
import MeetingRetrospective from '../../../../database/types/MeetingRetrospective'
import getKysely from '../../../../postgres/getKysely'
import {DataLoaderWorker} from '../../../graphql'

const getComments = async (reflectionGroupId: string, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const IGNORE_COMMENT_USER_IDS = ['parabolAIUser']
  const discussion = await pg
    .selectFrom('Discussion')
    .selectAll()
    .where('discussionTopicId', '=', reflectionGroupId)
    .limit(1)
    .executeTakeFirst()
  if (!discussion) return null
  const {id: discussionId} = discussion
  const rawComments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
  const humanComments = rawComments.filter((c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy))
  const rootComments = humanComments.filter((c) => !c.threadParentId)
  rootComments.sort((a, b) => {
    return a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1
  })
  const comments = await Promise.all(
    rootComments.map(async (comment) => {
      const {createdBy, isAnonymous, plaintextContent} = comment
      const creator = await dataLoader.get('users').loadNonNull(createdBy)
      const commentAuthor = isAnonymous ? 'Anonymous' : creator.preferredName
      const commentReplies = await Promise.all(
        humanComments
          .filter((c) => c.threadParentId === comment.id)
          .sort((a, b) => {
            return a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1
          })
          .map(async (reply) => {
            const {createdBy, isAnonymous, plaintextContent} = reply
            const creator = await dataLoader.get('users').loadNonNull(createdBy)
            const replyAuthor = isAnonymous ? 'Anonymous' : creator.preferredName
            return {
              text: plaintextContent,
              author: replyAuthor
            }
          })
      )
      const res = {
        text: plaintextContent,
        author: commentAuthor,
        replies: commentReplies
      }
      if (res.replies.length === 0) {
        delete (res as any).commentReplies
      }
      return res
    })
  )
  return comments
}

export const getTopics = async (
  teamId: string,
  startDate: Date,
  endDate: Date,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const MIN_REFLECTION_COUNT = 3
  const MIN_MILLISECONDS = 60 * 1000 // 1 minute
  const rawMeetings = await r
    .table('NewMeeting')
    .getAll(teamId, {index: 'teamId'})
    .filter((row: any) =>
      row('meetingType')
        .eq('retrospective')
        .and(row('createdAt').ge(startDate))
        .and(row('createdAt').le(endDate))
        .and(row('reflectionCount').gt(MIN_REFLECTION_COUNT))
        .and(r.table('MeetingMember').getAll(row('id'), {index: 'meetingId'}).count().gt(1))
        .and(row('endedAt').sub(row('createdAt')).gt(MIN_MILLISECONDS))
    )
    .run()

  const meetings = await Promise.all(
    rawMeetings.map(async (meeting) => {
      const {
        id: meetingId,
        disableAnonymity,
        name: meetingName,
        createdAt: meetingDate
      } = meeting as MeetingRetrospective
      const rawReflectionGroups = await dataLoader
        .get('retroReflectionGroupsByMeetingId')
        .load(meetingId)
      const reflectionGroups = Promise.all(
        rawReflectionGroups
          .filter((g) => g.voterIds.length > 0)
          .map(async (group) => {
            const {id: reflectionGroupId, voterIds, title} = group
            const [comments, rawReflections] = await Promise.all([
              getComments(reflectionGroupId, dataLoader),
              dataLoader.get('retroReflectionsByGroupId').load(group.id)
            ])
            const reflections = await Promise.all(
              rawReflections.map(async (reflection) => {
                const {promptId, creatorId, plaintextContent} = reflection
                const [prompt, creator] = await Promise.all([
                  dataLoader.get('reflectPrompts').load(promptId),
                  creatorId ? dataLoader.get('users').loadNonNull(creatorId) : null
                ])
                const {question} = prompt
                const creatorName =
                  disableAnonymity && creator ? creator.preferredName : 'Anonymous'
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
              reflections,
              meetingName,
              date: meetingDate,
              meetingId
            }

            if (!res.comments || !res.comments.length) {
              delete (res as any).comments
            }
            return res
          })
      )
      return reflectionGroups
    })
  )

  const hotTopics = meetings
    .flat()
    .filter((t) => t.voteCount > 2)
    .sort((a, b) => (a.voteCount > b.voteCount ? -1 : 1))

  type IDLookup = Record<string, string | Date>
  const idLookup = {
    meeting: {} as IDLookup,
    date: {} as IDLookup
  }

  const idGenerator = {
    meeting: 1
  }

  const shortTokenedTopics = hotTopics.map((t) => {
    const {date, meetingId} = t
    const shortMeetingId = `m${idGenerator.meeting++}`
    const shortMeetingDate = new Date(date).toISOString().split('T')[0]
    idLookup.meeting[shortMeetingId] = meetingId
    idLookup.date[shortMeetingId] = date
    return {
      ...t,
      date: shortMeetingDate,
      meetingId: shortMeetingId
    }
  })
  return shortTokenedTopics
}
