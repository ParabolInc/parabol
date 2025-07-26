import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'

export const getTaskBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const tasks = await dataLoader.get('tasksByMeetingId').load(meetingId)
  const taskBlocks = await Promise.all(
    tasks.map(async (task) => {
      const {content, userId, status, integration} = task
      if (!userId) return null
      const user = await dataLoader.get('users').loadNonNull(userId)
      const {preferredName, picture} = user
      return {
        type: 'taskBlock' as const,
        attrs: {
          content,
          preferredName,
          avatar: picture,
          service: integration?.service,
          status
        }
      }
    })
  )
  const validTaskBlocks = taskBlocks.filter(isValid)
  const taskCount = validTaskBlocks.length
  if (taskCount === 0) return []
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [{type: 'text', text: `${taskCount} ${plural(taskCount, 'Task')}`}]
    },
    ...validTaskBlocks
  ]
}
