import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  // We have about 2500 such tasks
  const missedTasks = await r
    .table('Task')
    .filter((row) => row.hasFields('plaintextContent').not())
    .run()

  console.log('Missed tasks found:', missedTasks.length)

  if (missedTasks.length) {
    const updates = [] as {
      taskId: string
      plaintextContent: string
    }[]
    for (const task of missedTasks) {
      updates.push({
        taskId: task.id,
        plaintextContent: extractTextFromDraftString(task.content)
      })
    }
    const updateResult = await r(updates)
      .forEach((updateObj) => {
        return r
          .table('Task')
          .get(updateObj('taskId'))
          .update(
            {
              plaintextContent: updateObj('plaintextContent')
            },
            {
              returnChanges: true
            }
          )
      })('changes')
      .run()

    console.log('Updated:', updateResult?.length)
  }
}

export const down = function () {
  // noop
}
