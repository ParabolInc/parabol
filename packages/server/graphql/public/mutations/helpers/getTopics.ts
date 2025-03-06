import yaml from 'js-yaml'
import {sql} from 'kysely'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import sendToSentry from '../../../../utils/sendToSentry'
import standardError from '../../../../utils/standardError'
import {DataLoaderWorker} from '../../../graphql'
import {RetrospectiveMeeting} from '../../resolverTypes'

export const getComments = async (reflectionGroupId: string, dataLoader: DataLoaderInstance) => {
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
            const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
            const replyAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
            return {
              text: plaintextContent,
              author: replyAuthor
            }
          })
      )
      return commentReplies.length === 0
        ? {
            text: plaintextContent,
            author: commentAuthor
          }
        : {
            text: plaintextContent,
            author: commentAuthor,
            replies: commentReplies
          }
    })
  )
  return comments
}

type MeetingLookup = Record<string, string | Date>
const meetingLookup: MeetingLookup = {}

const processLines = (lines: string[]): string[] => {
  const meetingURL = `https://${process.env.HOST}/meet/`
  return lines
    .map((line) => {
      if (line.includes(meetingURL)) {
        let processedLine = line
        const regex = new RegExp(`${meetingURL}\\S+`, 'g')
        const matches = processedLine.match(regex) || []

        let isValid = true
        matches.forEach((match) => {
          const shortMeetingId = match.split(meetingURL)[1]?.split(/[),\s]/)[0] // Split by closing parenthesis, comma, or space
          const actualMeetingId = shortMeetingId && (meetingLookup[shortMeetingId] as string)

          if (shortMeetingId && actualMeetingId) {
            processedLine = processedLine.replace(shortMeetingId, actualMeetingId)
          } else {
            const error = new Error(
              `AI hallucinated. Unable to find meetingId for ${shortMeetingId}. Line: ${line}`
            )
            sendToSentry(error)
            isValid = false
          }
        })
        return isValid ? processedLine : ''
      }
      return line
    })
    .filter((line) => line.trim() !== '')
}

const processSection = (section: string[]): string[] => {
  return section
    .flatMap((item) => {
      const lines = item.split('\n')
      return processLines(lines)
    })
    .filter((processedItem) => processedItem.trim() !== '')
}

export const getTopics = async (
  teamId: string,
  startDate: Date,
  endDate: Date,
  dataLoader: DataLoaderWorker,
  prompt?: string | null
) => {
  const pg = getKysely()
  const MIN_REFLECTION_COUNT = 3
  const MIN_SECONDS = 60
  const rawMeetingsWithAnyMembers = await pg
    .selectFrom('NewMeeting')
    .select(['id', 'name', 'createdAt', 'disableAnonymity'])
    .where('teamId', '=', teamId)
    .where('meetingType', '=', 'retrospective')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .where('reflectionCount', '>=', MIN_REFLECTION_COUNT)
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

  const meetings = await Promise.all(
    rawMeetings.map(async (meeting) => {
      const {id: meetingId, disableAnonymity, name: meetingName, createdAt: meetingDate} = meeting
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
                  dataLoader.get('reflectPrompts').loadNonNull(promptId),
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

  const idGenerator = {
    meeting: 1
  }

  const shortTokenedTopics = hotTopics
    .map((t) => {
      const {date, meetingId} = t
      const shortMeetingId = `m${idGenerator.meeting++}`
      const shortMeetingDate = new Date(date).toISOString().split('T')[0]
      meetingLookup[shortMeetingId] = meetingId
      return {
        ...t,
        date: shortMeetingDate,
        meetingId: shortMeetingId
      }
    })
    .filter((t) => t)

  if (shortTokenedTopics.length === 0) {
    return standardError(new Error('No meeting content found for the specified date range.'))
  }

  const yamlData = yaml.dump(shortTokenedTopics, {
    noCompatMode: true
  })

  const openAI = new OpenAIServerManager()
  const rawInsight = await openAI.generateInsight(yamlData, false, prompt)
  if (!rawInsight) {
    return standardError(new Error('Unable to generate insight.'))
  }

  const wins = processSection(rawInsight.wins)
  const challenges = processSection(rawInsight.challenges)
  const meetingIds = rawMeetings.map((meeting) => meeting.id)

  return {wins, challenges, meetingIds}
}
