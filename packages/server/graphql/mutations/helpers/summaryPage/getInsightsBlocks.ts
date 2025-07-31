import dayjs from 'dayjs'
import yaml from 'js-yaml'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {quickHash} from '../../../../../client/shared/utils/quickHash'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {Team} from '../../../../postgres/types'
import type {makeMeetingInsightInput} from '../../../../utils/makeMeetingInsightInput'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'

const FAIL_TEXT = 'Not enough data to generate insights'

const insightsPrompt = `You are an expert in agile retrospectives and project management.
Your team has just completed a retrospective and it is your job to generate insights from the data and report to senior management.
Senior management wants to know where to best focus their time, so be concise and focus on next steps to take.
If there is not enough data to generate insightful findings, respond with "${FAIL_TEXT}".
It should include at most 3 topics that are the most important highlights, takeaways, or areas that may need their attention.
Below I will provide you with a user-defined prompt and data containing meeting discussions, work completed, and agile stories with points, all in YAML format.
Your response should be in markdown format. Do not use horizontal rules to separate sections.
The format:
- (gold emoji) bold text as highlight: expanded explanation and/or suggested action
- (silver emoji) bold text as highlight: expanded explanation and/or suggested action
- (copper emoji) bold text as highlight: expanded explanation and/or suggested action
`

const FAILED_SUMMARY_BLOCK = [{type: 'paragraph', content: [{type: 'text', text: FAIL_TEXT}]}]

const getInsightsContent = async (
  meetingInsightObject: Awaited<ReturnType<typeof makeMeetingInsightInput>>,
  team: Team
) => {
  if (!meetingInsightObject) {
    return FAILED_SUMMARY_BLOCK
  }
  const {name: teamName} = team
  const dataByTeam = {
    teamName,
    meeting: meetingInsightObject
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
        content: insightsPrompt
      },
      {
        role: 'user',
        content: yamlData
      }
    ]
  })
  const responseContent = response.choices[0]?.message?.content?.trim()
  if (!responseContent || responseContent.includes(FAIL_TEXT)) {
    return FAILED_SUMMARY_BLOCK
  }
  const content = markdownToTipTap(responseContent)
  return content
}

export const getInsightsBlocks = async (
  meetingId: string,
  meetingInsightObject: Awaited<ReturnType<typeof makeMeetingInsightInput>>,
  dataLoader: DataLoaderInstance
) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId, createdAt, endedAt} = meeting
  const startTime = dayjs(createdAt)
  const endTime = dayjs(endedAt)
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {orgId} = team
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {useAI} = organization
  const startTimeRange = startTime.subtract(1, 'hour').toISOString()
  const endTimeRange = endTime.add(1, 'hour').toISOString()
  const content = useAI ? await getInsightsContent(meetingInsightObject, team) : []
  return [
    {type: 'paragraph'},
    {
      type: 'insightsBlock',
      attrs: {
        id: crypto.randomUUID(),
        editing: false,
        teamIds: [teamId],
        meetingTypes: ['retrospective'],
        after: startTimeRange,
        before: endTimeRange,
        meetingIds: [meetingId],
        title: 'Top Topics',
        hash: await quickHash([meetingId, insightsPrompt]),
        prompt: insightsPrompt,
        error: !useAI ? 'disabled' : content === FAILED_SUMMARY_BLOCK ? 'nodata' : undefined
      },
      content
    }
  ]
}
