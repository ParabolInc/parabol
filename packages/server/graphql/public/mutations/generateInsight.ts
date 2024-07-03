import yaml from 'js-yaml'
import fs from 'node:fs'
import getRethink from '../../../database/rethinkDriver'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const generateInsight: MutationResolvers['generateInsight'] = async (
  _source,
  // {teamId, orgId, startDate, endDate},
  {teamId, orgId}: {teamId?: string; orgId?: string},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const getComments = async (reflectionGroupId: string) => {
    const IGNORE_COMMENT_USER_IDS = ['parabolAIUser']
    const pg = getKysely()
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

  const getTopicJSON = async (teamIds: string[], startDate: Date, endDate: Date) => {
    const r = await getRethink()
    const MIN_REFLECTION_COUNT = 3
    const MIN_MILLISECONDS = 60 * 1000 // 1 minute
    const rawMeetings = await r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
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
          teamId,
          name: meetingName,
          createdAt: meetingDate
        } = meeting as MeetingRetrospective
        const [team, rawReflectionGroups] = await Promise.all([
          orgId ? dataLoader.get('teams').loadNonNull(teamId) : null,
          dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
        ])
        const {name: teamName} = team ?? {}
        const reflectionGroups = Promise.all(
          rawReflectionGroups
            // for performance since it's really slow!
            // .filter((g) => g.voterIds.length > 0)
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
                meetingId,
                ...(teamName ? {teamName} : {})
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

  const getTeamIds = async (orgId?: string, teamId?: string) => {
    if (teamId) return [teamId]
    const teams = await dataLoader.get('teamsByOrgIds').load(orgId!)
    return teams.map((team) => team.id)
  }

  const teamIds = await getTeamIds(orgId, teamId)

  const startDate = new Date('2024-01-01')
  // const endDate = new Date('2024-04-01')
  const endDate = new Date()

  const identifier = teamId ?? orgId
  const inTopics = await getTopicJSON(teamIds, startDate, endDate)
  if (!inTopics.length) {
    return standardError(new Error('Not enough data to generate insight.'))
  }
  fs.writeFileSync(`./topics_${identifier}.json`, JSON.stringify(inTopics))

  const rawTopics = JSON.parse(fs.readFileSync(`./topics_${identifier}.json`, 'utf-8')) as Awaited<
    ReturnType<typeof getTopicJSON>
  >
  const hotTopics = rawTopics
  // .filter((t) => t.voteCount > 2)
  // .sort((a, b) => (a.voteCount > b.voteCount ? -1 : 1))

  type IDLookup = Record<string, string | Date>
  const idLookup = {
    meeting: {} as IDLookup,
    date: {} as IDLookup
  }

  const idGenerator = {
    meeting: 1
  }
  console.log('🚀 ~ hotTopics:', hotTopics)

  const shortTokenedTopics = hotTopics.map((t) => {
    const {date, meetingId} = t
    const shortMeetingId = `m${idGenerator.meeting++}`
    const shortMeetingDate = new Date(date).toISOString().split('T')[0]
    console.log('🚀 ~ shortMeetingId:', shortMeetingId)
    idLookup.meeting[shortMeetingId] = meetingId
    idLookup.date[shortMeetingId] = date
    return {
      ...t,
      date: shortMeetingDate,
      meetingId: shortMeetingId
    }
  })
  // fs.writeFileSync('./topics_target_short.json', JSON.stringify(shortTokenedTopics))
  const yamlData = yaml.dump(shortTokenedTopics, {
    noCompatMode: true // This option ensures compatibility mode is off
  })
  fs.writeFileSync(`./topics_${identifier}_short.yml`, yamlData)

  const meetingURL = 'https://action.parabol.co/meet/'

  const summarizingPrompt = `
  You are a management consultant who needs to discover behavioral trends for a given team.
  Below is a list of reflection topics in YAML format from meetings over the last 3 months.
  You should describe the situation in two sections with no more than 3 bullet points each.
  The first section should describe the team's positive behavior in bullet points. One bullet point should cite a direct quote from the meeting, attributing it to the person who wrote it.
  The second section should pick out one or two examples of the team's negative behavior and you should cite a direct quote from the meeting, attributing it to the person who wrote it.
  When citing the quote, inlcude the meetingId in the format of ${meetingURL}[meetingId].
  For each topic, mention how many votes it has.
  Be sure that each author is only mentioned once.
  Above the two sections, include a short subject line that mentions the team name and summarizes the negative behavior mentioned in the second paragraph.
  The subject must not be generic sounding. The person who reads the subject should instantly know that the person who wrote it has deep understanding of the team's problems.
  The format of the subject line should be the following: Subject: [Team Name] [Short description of the negative behavior]
  Your tone should be kind and professional. No yapping.`

  const openAI = new OpenAIServerManager()
  const batch = await openAI.batchChatCompletion(summarizingPrompt, yamlData)
  if (!batch) {
    return standardError(new Error('Unable to generate insight.'))
  }

  const lines = batch.split('\n')

  const processedLines = lines.map((line) => {
    const hasMeetingId = line.includes(meetingURL)
    if (hasMeetingId) {
      let shortMeetingId = line.split(meetingURL)[1]
      if (shortMeetingId) {
        shortMeetingId = shortMeetingId.split(/[),]/)[0] // Split by closing parenthesis or comma
      }
      const actualMeetingId = shortMeetingId && (idLookup.meeting[shortMeetingId] as string)

      if (shortMeetingId && actualMeetingId) {
        return line.replace(shortMeetingId, actualMeetingId)
      } else {
        const error = new Error(
          `AI hallucinated. Unable to find meetingId for ${shortMeetingId}. Line: ${line}`
        )
        sendToSentry(error)
        return ''
      }
    }
    return line
  })

  const insight = processedLines.filter((line) => line.trim() !== '').join('\n')
  console.log('🚀 ~ insight:', insight)

  // RESOLUTION
  const data = {}
  return data
}

export default generateInsight
