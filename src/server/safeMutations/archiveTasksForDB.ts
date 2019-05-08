import {convertFromRaw, convertToRaw} from 'draft-js'
import getRethink from 'server/database/rethinkDriver'
import addTagToTask from 'universal/utils/draftjs/addTagToTask'
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap'
import {ITask} from 'universal/types/graphql'

type Task = Pick<ITask, 'content' | 'id' | 'tags'>
const archiveTasksForDB = async (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) return []
  const r = getRethink()
  const tasksToArchive = tasks.map((task) => {
    const contentState = convertFromRaw(JSON.parse(task.content))
    const nextContentState = addTagToTask(contentState, '#archived')
    const raw = convertToRaw(nextContentState)
    const nextTags = getTagsFromEntityMap(raw.entityMap)
    const nextContentStr = JSON.stringify(raw)
    return {
      content: nextContentStr,
      tags: nextTags,
      id: task.id
    }
  })
  const updatedTasks = await r(tasksToArchive)
    .forEach((task) => {
      return r
        .table('Task')
        .get(task('id'))
        .update(
          {
            content: task('content'),
            tags: task('tags')
          },
          {returnChanges: true}
        )
    })('changes')('new_val')
    .default([])

  return updatedTasks
}

export default archiveTasksForDB
