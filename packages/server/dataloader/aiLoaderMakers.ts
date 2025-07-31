import DataLoader from 'dataloader'
import yaml from 'js-yaml'
import {makeMeetingInsightInput} from '../utils/makeMeetingInsightInput'
import OpenAIServerManager from '../utils/OpenAIServerManager'
import type RootDataLoader from './RootDataLoader'

export const NOT_ENOUGH_DATA_FOR_INSIGHTS = 'Not enough data to generate insights'
export const AI_DISABLED = 'AI is disabled for the organization'
export const AI_FAILED = 'There was a problem connecting to the AI'

export const summaryInsightsPrompt = `You are an expert in agile retrospectives and project management.
Your team has just completed a retrospective and it is your job to generate insights from the data and report to senior management.
Senior management wants to know where to best focus their time, so be concise and focus on next steps to take.
If there is not enough data to generate insightful findings, respond with "${NOT_ENOUGH_DATA_FOR_INSIGHTS}".
It should include at most 3 topics that are the most important highlights, takeaways, or areas that may need their attention.
The format:
- (gold emoji) bold text as highlight: expanded explanation and/or suggested action
- (silver emoji) bold text as highlight: expanded explanation and/or suggested action
- (copper emoji) bold text as highlight: expanded explanation and/or suggested action
`
export const meetingInsightsInput = (parent: RootDataLoader) => {
  return new DataLoader<string, Awaited<ReturnType<typeof makeMeetingInsightInput>>, string>(
    async (meetingIds) => {
      const inputs = await Promise.all(
        meetingIds.map(async (meetingId) => {
          const meeting = await parent.get('newMeetings').loadNonNull(meetingId)
          const input = await makeMeetingInsightInput(meeting, parent)
          return input
        })
      )
      return inputs
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const meetingInsightsContent = (parent: RootDataLoader) => {
  return new DataLoader<
    string,
    {content?: string; error?: 'nodata' | 'disabled' | 'modelFail'},
    string
  >(
    async (meetingIds) => {
      const contents = await Promise.all(
        meetingIds.map(async (meetingId) => {
          const input = await parent.get('meetingInsightsInput').load(meetingId)
          if (!input) return {error: 'nodata' as const}
          const meeting = await parent.get('newMeetings').loadNonNull(meetingId)
          const {teamId} = meeting
          const team = await parent.get('teams').loadNonNull(teamId)
          const {orgId} = team
          const organization = await parent.get('organizations').loadNonNull(orgId)
          const {useAI} = organization
          if (!useAI) return {error: 'disabled' as const}
          const {name: teamName} = team
          const dataByTeam = {
            teamName,
            meeting: input
          }
          const yamlData = yaml.dump(dataByTeam, {
            noCompatMode: true
          })
          const openAI = new OpenAIServerManager()
          const response = await openAI.openAIApi!.chat.completions.create({
            model: 'o3-mini',
            messages: [
              {
                role: 'system',
                content: `Below I will provide you with a user-defined prompt and data containing meeting discussions, work completed, and agile stories with points, all in YAML format.
Your response should be in markdown format. Do not use horizontal rules to separate sections.`
              },
              {
                role: 'system',
                content: summaryInsightsPrompt
              },
              {
                role: 'user',
                content: yamlData
              }
            ]
          })
          const responseContent = response.choices[0]?.message?.content?.trim()
          if (!responseContent) return {error: 'modelFail' as const}
          if (responseContent.includes(NOT_ENOUGH_DATA_FOR_INSIGHTS))
            return {error: 'nodata' as const}
          return {content: responseContent}
        })
      )
      return contents
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
