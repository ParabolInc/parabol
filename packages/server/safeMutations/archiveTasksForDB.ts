import {sql} from 'kysely'
import addTagToTask from '../../client/shared/tiptap/addTagToTask'
import {getTagsFromTipTapTask} from '../../client/shared/tiptap/getTagsFromTipTapTask'
import getKysely from '../postgres/getKysely'
import type {Task} from '../postgres/types/index.d'
import type {Json, Tasktagenum} from '../postgres/types/pg'
import {convertToTipTap} from '../utils/convertToTipTap'

const archiveTasksForDB = async (tasks: Task[], doneMeetingId?: string) => {
  if (!tasks || tasks.length === 0) return []
  const pg = getKysely()
  const tasksToArchive = tasks.map((task) => {
    const content = convertToTipTap(task.content)
    const nextContent = addTagToTask(content, 'archived')
    const nextTags = getTagsFromTipTapTask(nextContent)

    // update cache
    task.content = JSON.stringify(nextContent)
    task.tags.push('archived')

    return {
      content: nextContent,
      tags: nextTags,
      id: task.id
    }
  })
  await pg
    .updateTable('Task')
    .from(
      sql<{
        id: string
        content: Json
        tags: Tasktagenum[]
      }>`jsonb_to_recordset(${JSON.stringify(tasksToArchive)}::jsonb)`.as<'archived'>(
        sql`archived("id" varchar, "content" jsonb, "tags" "TaskTagEnum"[])`
      )
    )
    .set((eb) => ({
      content: eb.ref('archived.content'),
      tags: eb.ref('archived.tags'),
      doneMeetingId
    }))
    .whereRef('Task.id', '=', 'archived.id')
    .execute()
  return tasksToArchive.map(({id}) => id)
}

export default archiveTasksForDB
