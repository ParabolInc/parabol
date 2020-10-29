import {R} from 'rethinkdb-ts'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import Task from '../types/Task'

export const up = async function(r: R) {
  const updateBatch = async (tasks: Task[]) => {
    const updates = [] as {
      taskId: string
      plaintextContent: string
    }[]
    for (const task of tasks) {
      updates.push({
        taskId: task.id,
        plaintextContent: extractTextFromDraftString(task.content)
      })
    }
    await r(updates)
      .forEach((update) => {
        return r
          .table('Task')
          .get(update('taskId'))
          .update({
            plaintextContent: update('plaintextContent')
          })
      })
      .run()
  }

  try {
    let i = 0
    const batchSize = 10000
    while (true) {
      const tasks = await r
        .table('Task')
        .orderBy('id', {index: 'id'})
        .skip(batchSize * i)
        .limit(batchSize)
        .run()
      if (!tasks?.length) break
      updateBatch(tasks)
      i++
    }
    /* process any new tasks that may have come in during first iteration */
    const missedTasks = await r
      .table('Task')
      .filter((row) => row.hasFields('plaintextContent').not())
      .run()
    updateBatch(missedTasks)
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('Task')
      .replace((row) => row.without('plaintextContent'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
