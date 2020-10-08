import {R} from 'rethinkdb-ts'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'

export const up = async function(r: R) {
  try {
    const tasks = await r.table('Task').run()
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
