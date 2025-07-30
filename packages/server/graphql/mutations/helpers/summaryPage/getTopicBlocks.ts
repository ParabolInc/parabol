import makeAppURL from '../../../../../client/utils/makeAppURL'
import plural from '../../../../../client/utils/plural'
import appOrigin from '../../../../appOrigin'
import type {makeMeetingInsightInput} from '../../../../utils/makeMeetingInsightInput'

export const getTopicBlocks = (
  meetingId: string,
  meetingInsightObject: Awaited<ReturnType<typeof makeMeetingInsightInput>>
) => {
  if (!meetingInsightObject) return []
  const retroMeetingInsights = meetingInsightObject as Extract<
    typeof meetingInsightObject,
    {meetingType: 'retrospective'}
  >
  const {topics} = retroMeetingInsights
  if (!topics || !topics.length) return []
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [
        {
          type: 'text',
          text: `${topics.length} ${plural(topics.length, 'Voted Topic')}`
        }
      ]
    },
    {
      type: 'bulletList',
      attrs: {tight: true},
      content: topics.map((topic) => {
        const {title, voteCount, comments, tasks, reflections, stageNumber} = topic
        const commentCount = comments?.length ?? 0
        const taskCount = tasks?.length ?? 0
        const reflectionCount = reflections?.length ?? 0
        const href = makeAppURL(appOrigin, `/meet/${meetingId}/discuss/${stageNumber}`)
        const meta = [
          `${voteCount} ${plural(voteCount, 'Vote')}`,
          `${taskCount} ${plural(taskCount, 'Task')}`,
          `${commentCount} ${plural(commentCount, 'Comment')}`,
          `${reflectionCount} ${plural(reflectionCount, 'Reflection')}`
        ]
        const subtitle = meta.join(', ')
        return {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: title,
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href,
                        target: '_blank',
                        rel: 'noopener noreferrer nofollow',
                        class: 'link'
                      }
                    },
                    {type: 'bold', attrs: {}}
                  ]
                },
                {type: 'hardBreak'},
                {type: 'text', text: subtitle}
              ]
            }
          ]
        }
      })
    }
  ]
}
