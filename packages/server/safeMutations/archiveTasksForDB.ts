import {convertFromRaw, convertToRaw} from 'draft-js'
import addTagToTask from 'parabol-client/utils/draftjs/addTagToTask'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import getRethink from '../database/rethinkDriver'
import Task from '../database/types/Task'
import getKysely from '../postgres/getKysely'

const archiveTasksForDB = async (tasks: Task[], doneMeetingId?: string) => {
  if (!tasks || tasks.length === 0) return []
  const pg = getKysely()
  const r = await getRethink()
  const tasksToArchive = tasks.map((task) => {
    const contentState = convertFromRaw(JSON.parse(task.content))
    const nextContentState = addTagToTask(contentState, '#archived')
    const raw = convertToRaw(nextContentState)
    const nextTags = getTagsFromEntityMap(raw.entityMap)
    const nextContentStr = JSON.stringify(raw)

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
  return r(tasksToArchive)
    .forEach((task) => {
      return r
        .table('Task')
        .get(task('id'))
        .update(
          {
            content: task('content') as unknown,
            tags: task('tags'),
            doneMeetingId: task('doneMeetingId').default(null)
          } as any,
          {returnChanges: true}
        )
    })
    .default([])('changes')('new_val')
    .run() as Promise<Task[]>
}

export default archiveTasksForDB
