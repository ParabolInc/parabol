const TaskSecondaryStatusId = {
  join: (taskSecondaryStatusId: number) => `taskSecondaryStatus:${taskSecondaryStatusId}`,
  split: (id: string) => {
    const [, taskSecondaryStatusId] = id.split(':')
    return Number(taskSecondaryStatusId)
  }
}

export default TaskSecondaryStatusId
