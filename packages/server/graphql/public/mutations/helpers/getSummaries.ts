import fs from 'fs'
import yaml from 'js-yaml'
import getRethink from '../../../../database/rethinkDriver'
import MeetingRetrospective from '../../../../database/types/MeetingRetrospective'
import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import getPhase from '../../../../utils/getPhase'
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

const getMeetingsContent = async (meeting: MeetingRetrospective, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const {id: meetingId, disableAnonymity, name: meetingName, createdAt: meetingDate} = meeting
  const rawReflectionGroups = await dataLoader
    .get('retroReflectionGroupsByMeetingId')
    .load(meetingId)
  const reflectionGroups = Promise.all(
    rawReflectionGroups
      .filter((g) => g.voterIds.length > 0)
      .map(async (group) => {
        const {id: reflectionGroupId, voterIds, title} = group
        const [comments, rawReflections, discussion] = await Promise.all([
          getComments(reflectionGroupId, dataLoader),
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
              dataLoader.get('reflectPrompts').load(promptId),
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
        const shortDate = meetingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
        console.log('🚀 ~ shortDate:', shortDate)
        const res = {
          voteCount: voterIds.length,
          title: title,
          comments,
          reflections,
          meetingName,
          date: shortDate,
          meetingId,
          discussionId: discussionIdx
        }

        if (!res.comments || !res.comments.length) {
          delete (res as any).comments
        }
        return res
      })
  )
  console.log('🚀 ~ reflectionGroups:', reflectionGroups)

  return reflectionGroups
}

export const getSummaries = async (
  teamId: string,
  startDate: Date,
  endDate: Date,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const MIN_MILLISECONDS = 60 * 1000 // 1 minute
  const MIN_REFLECTION_COUNT = 3

  const rawMeetings = (await r
    .table('NewMeeting')
    .getAll(teamId, {index: 'teamId'})
    .filter(
      (row: any) =>
        row('meetingType')
          .eq('retrospective')
          .and(row('createdAt').ge(startDate))
          .and(row('createdAt').le(endDate))
          // .and(row('reflectionCount').gt(MIN_REFLECTION_COUNT))
          .and(r.table('MeetingMember').getAll(row('id'), {index: 'meetingId'}).count().gt(1))
      // .and(row('endedAt').sub(row('createdAt')).gt(MIN_MILLISECONDS))
    )
    .run()) as MeetingRetrospective[]
  // console.log('🚀 ~ rawMeetings:', rawMeetings)
  const meetingsCount = rawMeetings.length
  console.log('🚀 ~ meetingsCount:', meetingsCount)

  const summaries = await Promise.all(
    rawMeetings.map(async (meeting) => {
      console.log('🚀 ~ meeting.summary____:', meeting.summary)
      const newlyGeneratedSummariesDate = new Date('2024-07-22T00:00:00Z')
      if (meeting.summary && meeting.updatedAt > newlyGeneratedSummariesDate) {
        console.log('returnnining__')
        return meeting.summary
      }
      const meetingsContent = await getMeetingsContent(meeting, dataLoader)
      const now = new Date()
      await r.table('NewMeeting').get(meeting.id).update({summary: undefined, updatedAt: now}).run()
      if (!meetingsContent || meetingsContent.length === 0) {
        console.log('🚀 ~ meetingsContent:', {meetingsContent, meeting})
        return null
      }
      const yamlData = yaml.dump(meetingsContent, {
        noCompatMode: true
      })
      fs.writeFileSync('meetingSummary.yaml', yamlData, 'utf8')

      const manager = new OpenAIServerManager()
      const newSummary = await manager.generateSummary(yamlData)
      console.log('🚀 ~ newSummary:', newSummary)

      if (newSummary) {
        const now = new Date()
        await r
          .table('NewMeeting')
          .get(meeting.id)
          .update({summary: newSummary, updatedAt: now})
          .run()
        meeting.summary = newSummary
      }
      return {
        meetingName: meeting.name,
        date: meeting.createdAt,
        summary: meeting.summary
      }
    })
  )

  return summaries
}

// import getRethink from '../../../../database/rethinkDriver'

// export const getSummaries = async (teamId: string, startDate: Date, endDate: Date) => {
//   const r = await getRethink()
//   const MIN_MILLISECONDS = 60 * 1000 // 1 minute
//   const MIN_REFLECTION_COUNT = 3

//   const rawMeetings = await r
//     .table('NewMeeting')
//     .getAll(teamId, {index: 'teamId'})
//     .filter((row: any) =>
//       row('meetingType')
//         .eq('retrospective')
//         .and(row('createdAt').ge(startDate))
//         .and(row('createdAt').le(endDate))
//         .and(row('reflectionCount').gt(MIN_REFLECTION_COUNT))
//         .and(row('summary').eq(null))
//         .and(r.table('MeetingMember').getAll(row('id'), {index: 'meetingId'}).count().gt(1))
//         .and(row('endedAt').sub(row('createdAt')).gt(MIN_MILLISECONDS))
//     )
//     .run()

//   console.log('🚀 ~ rawMeetings:', rawMeetings)
//   const summaries = rawMeetings.map((meeting) => ({
//     meetingId: meeting.id,
//     date: meeting.createdAt,
//     summary: meeting.summary
//   }))
//   console.log('🚀 ~ summaries____:', summaries)

//   return summaries
// }
