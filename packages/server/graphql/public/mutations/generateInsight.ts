import yaml from 'js-yaml'
import getRethink from '../../../database/rethinkDriver'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const generateInsight: MutationResolvers['generateInsight'] = async (
  _source,
  {teamId, startDate, endDate},
  {dataLoader}
) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return standardError(
      new Error('Invalid date format. Please use ISO 8601 format (e.g., 2024-01-01T00:00:00Z).')
    )
  }
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000
  if (end.getTime() - start.getTime() < oneWeekInMs) {
    return standardError(new Error('The end date must be at least one week after the start date.'))
  }

  const pg = getKysely()
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

  const getTopicJSON = async (teamId: string, startDate: Date, endDate: Date) => {
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
                getComments(reflectionGroupId),
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
    return meetings.flat()
  }

  const inTopics = await getTopicJSON(teamId, startDate, endDate)
  if (!inTopics.length) {
    return standardError(new Error('Not enough data to generate insight.'))
  }
  const hotTopics = inTopics
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
  const yamlData = yaml.dump(shortTokenedTopics, {
    noCompatMode: true // This option ensures compatibility mode is off
  })

  const openAI = new OpenAIServerManager()
  const batch = await openAI.generateInsight(yamlData)
  if (!batch) {
    return standardError(new Error('Unable to generate insight.'))
  }

  const meetingURL = 'https://action.parabol.co/meet/'

  const processLines = (lines: string[]): string => {
    return lines
      .map((line) => {
        if (line.includes(meetingURL)) {
          let processedLine = line
          const regex = new RegExp(`${meetingURL}\\S+`, 'g')
          const matches = processedLine.match(regex) || []

          let isValid = true
          matches.forEach((match) => {
            let shortMeetingId = match.split(meetingURL)[1]?.split(/[),\s]/)[0] // Split by closing parenthesis, comma, or space
            const actualMeetingId = shortMeetingId && (idLookup.meeting[shortMeetingId] as string)

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
          return isValid ? processedLine : '' // Return empty string if invalid
        }
        return line
      })
      .filter((line) => line.trim() !== '')
      .join('\n')
  }

  const processSection = (section: string[]): string => {
    return section
      .map((item) => {
        const lines = item.split('\n')
        return processLines(lines)
      })
      .filter((processedItem) => processedItem.trim() !== '')
      .join('\n')
  }

  const wins = processSection(batch.wins)
  const challenges = processSection(batch.challenges)

  await pg
    .insertInto('Insight')
    .values({
      teamId,
      wins,
      challenges,
      startDate,
      endDate
    })
    .execute()

  const data = {wins, challenges}
  return data
}

export default generateInsight
