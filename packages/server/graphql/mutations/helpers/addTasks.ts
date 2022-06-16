import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import Task, {TaskTagEnum} from '../../../database/types/Task'
import generateUID from '../../../generateUID'

interface InitialTask {
  plaintextContent: string
  sortOrder: number
  content: string
  status: 'active' | 'stuck' | 'done' | 'future'
}

export const addTasks = async (seedTasks: InitialTask[], teamId: string, userId: string) => {
  const now = new Date()
  const tasks: Task[] = seedTasks.map((proj) => ({
    ...proj,
    id: `${teamId}::${generateUID()}`,
    createdAt: now,
    createdBy: userId,
    tags: getTagsFromEntityMap<TaskTagEnum>(JSON.parse(proj.content).entityMap),
    teamId,
    userId,
    updatedAt: now
  }))

  const r = await getRethink()
  return r
    .table('Task')
    .insert(tasks, {returnChanges: true})
    .do((result: RValue) => {
      return r.table('TaskHistory').insert(
        result('changes').map((change: RValue) => ({
          id: generateUID(),
          content: change('new_val')('content'),
          taskId: change('new_val')('id'),
          status: change('new_val')('status'),
          teamId: change('new_val')('teamId'),
          userId: change('new_val')('userId'),
          updatedAt: change('new_val')('updatedAt')
        }))
      )
    })
    .run()
}
