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
  const defaultPrompt = `
You are an expert in agile retrospectives and project management. I will provide you with YAML data containing meeting discussions, work completed, and agile stories with points.

Analyze this data and provide key insights on:
- The most significant **wins** in terms of completed work, team collaboration, or project improvements.
- The biggest **challenges** faced by the team.
- Any **trends** in the conversations (e.g., recurring blockers, common frustrations, or successful strategies).
- Suggestions for improving efficiency based on the data.

Use a structured response format with **Wins**, **Challenges**, and **Recommendations**. No yapping. No introductory sentence. No horizontal rules to separate the sections. Use markdown formatting.
`

  const systemContent = prompt || defaultPrompt
  console.log('sending now')
  const rawInsightResponse = await openAI.chatCompletion({
    model: 'o3-mini',
    messages: [
      {
        role: 'system',
        content: systemContent
      },
      {
        role: 'user',
        content: `Here is the data:\n\n${yamlData}`
      }
    ]
  })
  const rawInsight = rawInsightResponse?.choices[0]?.message?.content
  if (!rawInsight) throw new Error('Could not fetch insights from provider')
  const tokenCost = rawInsightResponse?.usage?.total_tokens ?? 10_000
  console.log({tokenCost})
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
