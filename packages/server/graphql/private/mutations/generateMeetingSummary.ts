import yaml from 'js-yaml'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {selectNewMeetings} from '../../../postgres/select'
import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import getPhase from '../../../utils/getPhase'
import {MutationResolvers} from '../resolverTypes'

const generateMeetingSummary: MutationResolvers['generateMeetingSummary'] = async (
  _source,
  {teamIds, prompt},
  {dataLoader}
) => {
  const pg = getKysely()
  const MIN_SECONDS = 60
  const MIN_REFLECTION_COUNT = 3

  const endDate = new Date()
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(endDate.getFullYear() - 2)

  const rawMeetingsWithAnyMembers = await selectNewMeetings()
    .where('teamId', 'in', teamIds)
    .where('meetingType', '=', 'retrospective')
    .where('createdAt', '>=', twoYearsAgo)
    .where('createdAt', '<=', endDate)
    .where('reflectionCount', '>', MIN_REFLECTION_COUNT)
    .where(sql<boolean>`EXTRACT(EPOCH FROM ("endedAt" - "createdAt")) > ${MIN_SECONDS}`)
    .$narrowType<RetrospectiveMeeting>()
    .execute()

  const allMeetingMembers = await dataLoader
    .get('meetingMembersByMeetingId')
    .loadMany(rawMeetingsWithAnyMembers.map(({id}) => id))

  const rawMeetings = rawMeetingsWithAnyMembers.filter((_, idx) => {
    const meetingMembers = allMeetingMembers[idx]
    return Array.isArray(meetingMembers) && meetingMembers.length > 1
  })

  const getComments = async (reflectionGroupId: string) => {
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
    const humanComments = rawComments.filter((c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy!))
    const rootComments = humanComments.filter((c) => !c.threadParentId)
    rootComments.sort((a, b) => {
      return a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1
    })
    const comments = await Promise.all(
      rootComments.map(async (comment) => {
        const {createdBy, isAnonymous, plaintextContent} = comment
        const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
        const commentAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
        const commentReplies = await Promise.all(
          humanComments
            .filter((c) => c.threadParentId === comment.id)
            .sort((a, b) => {
              return a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1
            })
            .map(async (reply) => {
              const {createdBy, isAnonymous, plaintextContent} = reply
              const creator = createdBy
                ? await dataLoader.get('users').loadNonNull(createdBy)
                : null
              const replyAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
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

  const getMeetingsContent = async (meeting: RetrospectiveMeeting) => {
    const pg = getKysely()
    const {id: meetingId, disableAnonymity, name: meetingName, createdAt: meetingDate} = meeting
    const rawReflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    const reflectionGroups = Promise.all(
      rawReflectionGroups
        .filter((g) => g.voterIds.length > 1)
        .map(async (group) => {
          const {id: reflectionGroupId, voterIds, title} = group
          const [comments, rawReflections, discussion] = await Promise.all([
            getComments(reflectionGroupId),
            dataLoader.get('retroReflectionsByGroupId').load(group.id),
            pg
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
          const res = {
            voteCount: voterIds.length,
            title: title,
            comments,
            reflections,
            meetingName,
            date: shortMeetingDate,
            meetingId,
            discussionId: discussionIdx
          }

          if (!res.comments || !res.comments.length) {
            delete (res as any).comments
          }
          return res
        })
    )

    return reflectionGroups
  }
  const manager = new OpenAIServerManager()

  const updatedMeetingIds = await Promise.all(
    rawMeetings.map(async (meeting) => {
      if (meeting.meetingType !== 'retrospective') return null
      const meetingsContent = await getMeetingsContent(meeting)
      if (!meetingsContent || meetingsContent.length === 0) {
        return null
      }
      const yamlData = yaml.dump(meetingsContent, {
        noCompatMode: true
      })
      const newSummary = await manager.generateSummary(yamlData, prompt)
      if (!newSummary) return null

      await getKysely()
        .updateTable('NewMeeting')
        .set({summary: newSummary})
        .where('id', '=', meeting.id)
        .execute()
      meeting.summary = newSummary
      return meeting.id
    })
  )
  const filteredMeetingIds = updatedMeetingIds.filter(
    (meetingId): meetingId is string => meetingId !== null
  )
  const data = {meetingIds: filteredMeetingIds}
  return data
}

export default generateMeetingSummary
