import isOpenTask, {type ReviewableTask} from './isOpenTask'

const getUpdatesEmptyState = (
  teamTasks: readonly ReviewableTask[],
  ownerTaskCount: number,
  ownerName: string | null | undefined,
  isViewerStageOwner: boolean
) => {
  if (ownerTaskCount > 0) return null
  const next = isViewerStageOwner
    ? 'Press Next to move on, or add a card with +.'
    : 'Press Next to move on.'
  if (!teamTasks.some(isOpenTask)) {
    return {title: 'A clean slate', description: `Nobody on the team has an open task. ${next}`}
  }
  if (isViewerStageOwner) return {title: 'You have no tasks to review', description: next}
  return {
    title: ownerName ? `${ownerName} has no tasks to review` : 'No tasks to review',
    description: next
  }
}

export default getUpdatesEmptyState
