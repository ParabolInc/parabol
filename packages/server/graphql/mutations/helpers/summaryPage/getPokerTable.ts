import type {GraphQLResolveInfo} from 'graphql'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {PokerMeeting} from '../../../../postgres/types/Meeting'
import getPhase from '../../../../utils/getPhase'
import type {InternalContext} from '../../../graphql'
import isValid from '../../../isValid'
import Task from '../../../public/types/Task'
import {resolveStoryFinalScore} from '../../../resolvers/resolveStoryFinalScore'
import {resolveTaskIntegration} from '../../../resolvers/resolveTaskIntegration'

// this is really brittle, we need a better way of getting the title!
function extractTitleOrSummary(obj: Record<string, any>): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined

  // Look for 'title' or 'summary' at the current level
  for (const key of ['title', 'summary']) {
    if (key in obj && typeof obj[key] === 'string') {
      const story = obj[key]
      return story
        .slice(0, 256)
        .replace(/\n|\r/g, '')
        .replace(/\s{2,}/g, ' ')
    }
  }

  // Otherwise, recurse into nested objects
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const found = extractTitleOrSummary(value)
      if (found !== undefined) {
        return found
      }
    }
  }
  // Nothing found
  return undefined
}

export const getDimensionNames = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
  const {templateRefId} = meeting
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  return dimensions.map((d) => d.name)
}

export const getPokerRowData = async (
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
  const {phases} = meeting
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const agg = {} as Record<string, string[]>
  await Promise.all(
    stages.map(async (stage) => {
      const {dimensionRefIdx, taskId} = stage
      const finalScore = await resolveStoryFinalScore(
        taskId,
        meetingId,
        dimensionRefIdx,
        dataLoader
      )
      if (!agg[taskId]) {
        agg[taskId] = []
      }
      agg[taskId][dimensionRefIdx] = finalScore || 'N/A'
    })
  )
  const rows = await Promise.all(
    Object.entries(agg).map(async ([taskId, scores]) => {
      const task = await dataLoader.get('tasks').load(taskId)
      if (!task) return null
      const service = task.integration?.service
      const getTitle = Task.title as (task: {plaintextContent: string}) => string
      let title = getTitle(task)
      if (service) {
        let fieldName = '...info'
        switch (service) {
          case 'azureDevOps':
          case 'github':
          case 'gitlab':
            fieldName = 'title'
            break
          case 'jira':
          case 'jiraServer':
            fieldName = 'summary'
        }
        const integrationRes = await resolveTaskIntegration(task, context, info, fieldName)

        title = extractTitleOrSummary(integrationRes) ?? 'Unknown Story'
      }
      return [title, ...scores]
    })
  )
  return rows.filter(isValid)
}

export const getPokerTable = async (
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const dimensionNames = await getDimensionNames(meetingId, dataLoader)
  const pokerRowData = await getPokerRowData(meetingId, context, info)

  return [
    {type: 'paragraph'},
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: ['Story', ...dimensionNames].map((text) => ({
            type: 'tableHeader',
            attrs: {colspan: 1, rowspan: 1},
            content: [
              {
                type: 'paragraph',
                content: [{type: 'text', text, marks: [{type: 'bold', attrs: {}}]}]
              }
            ]
          }))
        },
        ...pokerRowData.map((row) => ({
          type: 'tableRow',
          content: row.map((text, idx) => ({
            type: 'tableCell',
            attrs: {colspan: 1, rowspan: 1},
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text,
                    marks: idx === 0 ? [{type: 'bold', attrs: {}}] : undefined
                  }
                ]
              }
            ]
          }))
        }))
      ]
    }
  ]
}
