import isTaskPrivate from './isTaskPrivate'

interface ReviewableTask {
  readonly userId?: string | null
  readonly tags: readonly string[]
}

const getTeamMemberTasks = <T extends ReviewableTask>(
  tasks: readonly T[],
  userId: string | null | undefined
) => tasks.filter((task) => !!userId && task.userId === userId && !isTaskPrivate(task.tags))

export default getTeamMemberTasks
