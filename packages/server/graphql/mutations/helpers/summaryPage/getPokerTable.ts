import type {GraphQLResolveInfo} from 'graphql'
import type {PokerMeeting} from '../../../../postgres/types/Meeting'
import getPhase from '../../../../utils/getPhase'
import type {GQLContext, InternalContext} from '../../../graphql'
import Task from '../../../public/types/Task'
import {resolveStoryFinalScore} from '../../../resolvers/resolveStoryFinalScore'
import {resolveTaskIntegration} from '../../../resolvers/resolveTaskIntegration'

// this is really brittle, we need a better way of getting the title!
function extractTitleOrSummary(obj: Record<string, any>): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined

  // Look for 'title' or 'summary' at the current level
  for (const key of ['title', 'summary']) {
    if (key in obj && typeof obj[key] === 'string') {
      return obj[key]
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

export const getPokerTable = async (
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
  const {phases, templateRefId} = meeting
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const dimensionNames = dimensions.map((d) => d.name)
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
      const task = await dataLoader.get('tasks').loadNonNull(taskId)
      const service = task.integration?.service
      const getTitle = Task.title as (task: {plaintextContent: string}) => string
      let title = getTitle(task)
      console.log('title 1', title)
      if (service) {
        console.log('title 2', service)
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
        const integrationRes = await resolveTaskIntegration(
          task,
          context as GQLContext,
          info,
          fieldName
        )

        title = extractTitleOrSummary(integrationRes) ?? 'Unknown Story'
        console.log('title 3', title, fieldName, integrationRes)
      }
      return {
        type: 'tableRow',
        content: [title, ...scores].map((text, idx) => ({
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
      }
    })
  )
  return [
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
        ...rows
      ]
    }
  ]
}
