export interface ClickUpApiError {
  err?: string
  error?: string
  ECODE?: string
}

export interface ClickUpApiWorkspace {
  id: string
  name: string
}

export interface ClickUpApiSpace {
  id: string
  name: string
  features?: {points?: {enabled?: boolean}}
}

export interface ClickUpApiList {
  id: string
  name: string
  permission_level?: 'read' | 'comment' | 'edit' | 'create'
  archived?: boolean
}

export interface ClickUpApiFolder {
  id: string
  name: string
  hidden?: boolean
  lists: Array<ClickUpApiList | string>
  parent_folder?: string
}

export interface ClickUpApiCustomField {
  id: string
  name: string
  type: string
  type_config?: {options?: {id: string; name: string}[]}
  value?: unknown
}

export interface ClickUpApiTask {
  id: string
  custom_id: string | null
  custom_item_id: number | null
  name: string
  description?: string
  markdown_description?: string
  status: {status: string; color: string; type: string}
  date_updated: string
  url: string
  team_id: string
  list: {id: string; name: string}
  folder: {id: string; name: string; hidden?: boolean}
  space: {id: string}
  custom_fields?: ClickUpApiCustomField[]
}
