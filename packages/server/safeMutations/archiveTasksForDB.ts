import addTagToTask from '../../client/shared/tiptap/addTagToTask'
import {getTagsFromTipTapTask} from '../../client/shared/tiptap/getTagsFromTipTapTask'
import getKysely from '../postgres/getKysely'
import {Task} from '../postgres/types/index.d'
import {convertToTipTap} from '../utils/convertToTipTap'

const archiveTasksForDB = async (tasks: Task[], doneMeetingId?: string) => {
  if (!tasks || tasks.length === 0) return []
  const pg = getKysely()
  const tasksToArchive = tasks.map((task) => {
    const content = convertToTipTap(task.content)
    const nextContent = addTagToTask(content, 'archived')
    const nextTags = getTagsFromTipTapTask(nextContent)
    const nextContentStr = JSON.stringify(nextContent)

    // update cache
    task.content = nextContentStr
    task.tags.push('archived')

    return {
      content: nextContentStr,
      doneMeetingId,
      tags: nextTags,
      id: task.id
    }
  })
  await Promise.all(
    tasksToArchive.map((t) =>
      pg
        .updateTable('Task')
        .set({content: t.content, tags: t.tags, doneMeetingId: t.doneMeetingId})
        .where('id', '=', t.id)
        .execute()
    )
  )
  return tasksToArchive.map(({id}) => id)
}

export default archiveTasksForDB
