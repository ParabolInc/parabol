export interface ClickUpTaskLookup {
  taskId: string
  isCustomId: boolean
  workspaceId: string | null
  isPastedLink: boolean
}

const TASK_LINK = /^(?:https?:\/\/)?app\.clickup\.com\/t\/(?:(\d+)\/)?([^/?#\s]+)\/?(?:[?#]\S*)?$/i
const CUSTOM_ID = /^[A-Z][A-Z0-9]*-\d+$/
const TASK_ID = /^[a-z0-9]+$/i
const TYPED_TASK_ID = /^(?=[a-z]*\d)[a-z0-9]+$/

const readClickUpTaskLookup = (queryString: string): ClickUpTaskLookup | null => {
  const link = TASK_LINK.exec(queryString)
  if (link) {
    const [, workspaceId = null, taskId = ''] = link
    if (workspaceId && CUSTOM_ID.test(taskId)) {
      return {taskId, isCustomId: true, workspaceId, isPastedLink: true}
    }
    return TASK_ID.test(taskId)
      ? {taskId, isCustomId: false, workspaceId: null, isPastedLink: true}
      : null
  }
  if (CUSTOM_ID.test(queryString)) {
    return {taskId: queryString, isCustomId: true, workspaceId: null, isPastedLink: false}
  }
  return TYPED_TASK_ID.test(queryString)
    ? {taskId: queryString, isCustomId: false, workspaceId: null, isPastedLink: false}
    : null
}

export default readClickUpTaskLookup
