import {Threshold} from 'parabol-client/types/constEnums'
import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const UPDATE_POKER_SCOPE = `
  mutation AddPokerStories($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      newStages {
        id
        taskId
        discussionId
        dimensionRef {
          name
          scale {
            values {
              label
            }
          }
        }
      }
    }
  }
`

type AddedStories = {updatePokerScope: {newStages: {taskId: string}[]}}

export default defineTool({
  name: 'add_poker_stories',
  title: 'Add stories to sprint poker',
  description: `Add tasks to a sprint poker meeting as stories to estimate. Each story gets one stage per dimension of the meeting's template, such as Story Points, and each new stage comes back with its dimension's name and the labels its scale takes, which vote_poker_story and set_poker_final_score need. A task already in the meeting, or not on the meeting's team, is skipped and listed in skippedTaskIds. It refuses a meeting that has ended, one that isn't sprint poker, one on a team you aren't on, more than ${Threshold.MAX_POKER_STORIES} stories in all, and tasks that are all from other teams. Needs meetings:write.`,
  inputSchema: z.object({
    meetingId: z
      .string()
      .describe('The sprint poker meeting id, from start_sprint_poker or list_meetings'),
    taskIds: z
      .array(z.string())
      .min(1)
      .max(Threshold.MAX_POKER_STORIES)
      .describe('The tasks to estimate, in order, from create_task or list_tasks')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, taskIds}) => {
    const added = await runGraphQL<AddedStories>(context, UPDATE_POKER_SCOPE, {
      meetingId,
      updates: taskIds.map((serviceTaskId) => ({service: 'PARABOL', serviceTaskId, action: 'ADD'}))
    })
    if (added.errors?.length || !added.data) return toolResult(added)
    const addedTaskIds = new Set(added.data.updatePokerScope.newStages.map(({taskId}) => taskId))
    const skippedTaskIds = [...new Set(taskIds)].filter((taskId) => !addedTaskIds.has(taskId))
    return toolResult({
      data: {...added.data, ...(skippedTaskIds.length > 0 && {skippedTaskIds})}
    })
  }
})
