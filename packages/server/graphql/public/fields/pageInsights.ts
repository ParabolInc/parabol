import yaml from 'js-yaml'
import {sql} from 'kysely'
import {marked} from 'marked'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {USER_AI_TOKENS_MONTHLY_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {makeMeetingInsightInput} from '../../../utils/makeMeetingInsightInput'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import isValid from '../../isValid'
import {UserResolvers} from '../resolverTypes'

export const pageInsights: NonNullable<UserResolvers['pageInsights']> = async (
  _source,
  {meetingIds, prompt, responseFormat},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  if (meetingIds.length > 500) {
    throw new Error('Too many meetings to summarize. Max 500')
  }
  const pg = getKysely()
  const aiUsage = await pg
    .selectFrom('AIRequest')
    .select(pg.fn.coalesce(pg.fn.sum<bigint>('tokenCost'), sql`0`).as('tokenUsage'))
    .where('userId', '=', viewerId)
    .where('createdAt', '>=', sql<Date>`NOW() - INTERVAL '30 days'`)
    .executeTakeFirstOrThrow()
  const {tokenUsage} = aiUsage
  if (Number(tokenUsage) >= USER_AI_TOKENS_MONTHLY_LIMIT) {
    throw new Error('You have exceeded your AI request quota. Please contact sales to increase')
  }
  console.log({tokenUsage})
  const meetings = (await dataLoader.get('newMeetings').loadMany(meetingIds)).filter(isValid)
  const teamIds = [...new Set(meetings.map(({teamId}) => teamId))]
  const teamMemberIds = teamIds.map((teamId) => TeamMemberId.join(teamId, viewerId))
  const teamMembers = (await dataLoader.get('teamMembers').loadMany(teamMemberIds)).filter(isValid)
  if (teamMembers.length < teamIds.length) {
    throw new Error('You must be a member of the team for each requested meetingId')
  }
  const teams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  const dataByTeam = await Promise.all(
    teams.map(async (team) => {
      const {id: teamId, name: teamName} = team
      const teamMeetings = meetings.filter((meeting) => meeting.teamId === teamId)
      const inputs = await Promise.all(
        teamMeetings.map((meeting) => makeMeetingInsightInput(meeting, dataLoader))
      )
      const validInputs = inputs.filter(isValid)
      if (validInputs.length === 0) return null
      return {
        teamName,
        meetings: validInputs
      }
    })
  )
  const yamlData = yaml.dump(dataByTeam, {
    noCompatMode: true
  })

  const openAI = new OpenAIServerManager()
  const existingPrompt = await pg
    .selectFrom('AIPrompt')
    .select('id')
    .where('userId', '=', viewerId)
    .where('content', '=', prompt)
    .limit(1)
    .executeTakeFirst()
  if (existingPrompt) {
    const {id: promptId} = existingPrompt
    await pg
      .updateTable('AIPrompt')
      .set({
        lastUsedAt: sql`CURRENT_TIMESTAMP`
      })
      .where('id', '=', promptId)
      .execute()
  } else {
    await pg
      .insertInto('AIPrompt')
      .values({
        userId: viewerId,
        content: prompt
      })
      .execute()
  }
  console.log('sending now')
  const rawInsightResponse = await openAI.chatCompletion({
    model: 'o3-mini',
    messages: [
      {
        role: 'system',
        content: `Below I will provide you with a user-defined prompt and data containing meeting discussions, work completed, and agile stories with points, all in YAML format.
First, ask yourself if the prompt below pertains to the themes of agile retrospectives or project management.
If not, respond with "Invalid prompt".
Your response should be in markdown format. Do not use horizontal rules to separate sections.`
      },
      {
        role: 'user',
        content: prompt
      },
      {
        role: 'user',
        content: `Here is the meeting data:\n\n${yamlData}`
      }
    ]
  })
  const rawInsight = rawInsightResponse?.choices[0]?.message?.content
  if (!rawInsight) throw new Error('Could not fetch insights from provider')
  const tokenCost = rawInsightResponse?.usage?.total_tokens ?? 10_000
  console.log({tokenCost})
  console.log(rawInsight)
  await pg.insertInto('AIRequest').values({userId: viewerId, tokenCost}).execute()

  if (responseFormat === 'markdown') return rawInsight
  const htmlInsight = await marked(rawInsight, {
    gfm: true,
    breaks: true
  })
  console.log(rawInsight)
  console.log(htmlInsight)
  return htmlInsight
}
