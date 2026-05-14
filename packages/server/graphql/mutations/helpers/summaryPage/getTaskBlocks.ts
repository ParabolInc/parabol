import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'
import computeRetroDiscussion from '../computeRetroDiscussion'

export const getTaskBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const tasks = await dataLoader.get('tasksByMeetingId').load(meetingId)
  const taskBlocks = await Promise.all(
    tasks.map(async (task) => {
      const {content, userId, status, integration, discussionId} = task
      if (!userId) return null
      const [user, retroDiscussion] = await Promise.all([
        dataLoader.get('users').loadNonNull(userId),
        computeRetroDiscussion(meetingId, discussionId, dataLoader)
      ])
      const {preferredName, picture} = user
      return {
        type: 'taskBlock' as const,
        attrs: {
          content,
          preferredName,
          avatar: picture,
          service: integration?.service,
          status,
          retroMeetingName: retroDiscussion?.meetingName,
          retroTopicTitle: retroDiscussion?.topicTitle,
          retroUrl: retroDiscussion?.url
        }
      }
    })
  )
  const validTaskBlocks = taskBlocks.filter(isValid)
  const taskCount = validTaskBlocks.length
  if (taskCount === 0) return []
  const spacedBlocks = validTaskBlocks.flatMap((taskBlock, idx) => {
    if (idx === 0) return [taskBlock]
    return [{type: 'paragraph'}, taskBlock]
  })

  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [{type: 'text', text: `${taskCount} ${plural(taskCount, 'Task')}`}]
    },
    ...spacedBlocks
  ]
}
