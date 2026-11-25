import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import omitPrivateTasks from '../../../../utils/omitPrivateTasks'

export const getTaskBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const tasks = await dataLoader.get('tasksByMeetingId').load(meetingId)
  const taskBlocks = await Promise.all(
    omitPrivateTasks(tasks).map(async (task) => {
      const {content, userId, status, integration} = task
      const user = userId ? await dataLoader.get('users').loadNonNull(userId) : null
      return {
        type: 'taskBlock' as const,
        attrs: {
          content,
          preferredName: user?.preferredName ?? 'Unassigned',
          avatar: user?.picture,
          service: integration?.service,
          status
        }
      }
    })
  )
  const taskCount = taskBlocks.length
  if (taskCount === 0) return []
  const spacedBlocks = taskBlocks.flatMap((taskBlock, idx) => {
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
