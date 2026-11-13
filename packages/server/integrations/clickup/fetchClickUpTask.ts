import ms from 'ms'
import type {ClickUpApiTask} from './ClickUpApiTypes'
import mapClickUpTask, {type ClickUpTaskSource} from './mapClickUpTask'
import readClickUpCached, {type ClickUpCacheAuth} from './readClickUpCached'

const TASK_MAX_AGE = ms('30s')

const fetchClickUpTask = (
  auth: ClickUpCacheAuth,
  taskId: string,
  customIdWorkspaceId: string | null = null
) =>
  readClickUpCached<ClickUpApiTask, ClickUpTaskSource>(
    auth,
    `/task/${encodeURIComponent(taskId)}`,
    {
      query: {
        ...(customIdWorkspaceId ? {custom_task_ids: true, team_id: customIdWorkspaceId} : {}),
        include_markdown_description: true
      }
    },
    TASK_MAX_AGE,
    mapClickUpTask
  )

export default fetchClickUpTask
