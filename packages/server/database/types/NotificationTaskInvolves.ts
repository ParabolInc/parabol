import Notification from './Notification'

export type TaskInvolvement = 'ASSIGNEE' | 'MENTIONEE'

interface Input {
  changeAuthorId: string
  involvement: TaskInvolvement
  taskId: string
  teamId: string
  userIds: string[]
}

export default class NotificationTaskInvolves extends Notification {
  changeAuthorId: string
  involvement: TaskInvolvement
  taskId: string
  teamId: string

  constructor (input: Input) {
    const {teamId, changeAuthorId, involvement, taskId, userIds} = input
    super({userIds, type: 'TASK_INVOLVES'})
    this.changeAuthorId = changeAuthorId
    this.involvement = involvement
    this.taskId = taskId
    this.teamId = teamId
  }
}
