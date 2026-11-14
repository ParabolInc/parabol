import ClickUpTaskId from 'parabol-client/integrations/clickup/shared/ClickUpTaskId'
import type {ClickUpApiCustomField, ClickUpApiTask} from './ClickUpApiTypes'

export interface ClickUpTaskSource {
  service: 'clickup'
  id: string
  title: string
  taskId: string
  customId: string | null
  url: string
  description: string
  status: {name: string; color: string; type: string}
  listId: string
  listName: string
  folderName: string | null
  spaceId: string
  customItemId: number | null
  customFields: ClickUpApiCustomField[]
  updatedAt: Date
  workspaceId: string
}

const toDate = (unixMs: string) => {
  const date = new Date(Number(unixMs))
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

const mapClickUpTask = (task: ClickUpApiTask): ClickUpTaskSource => {
  const {id, team_id: workspaceId, status, list, folder} = task
  return {
    service: 'clickup',
    id: ClickUpTaskId.join(workspaceId, id),
    title: task.name,
    taskId: id,
    customId: task.custom_id,
    url: task.url,
    description: task.markdown_description || task.description || '',
    status: {name: status.status, color: status.color, type: status.type},
    listId: list.id,
    listName: list.name,
    folderName: folder.hidden ? null : folder.name,
    spaceId: task.space.id,
    customItemId: task.custom_item_id,
    customFields: task.custom_fields ?? [],
    updatedAt: toDate(task.date_updated),
    workspaceId
  }
}

export default mapClickUpTask
