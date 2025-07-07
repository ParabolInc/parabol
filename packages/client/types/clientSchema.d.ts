export interface ClientRetroReflection {
  isViewerDragging: boolean | null | undefined
  isDropping: boolean | null | undefined
  remoteDrag: IRemoteReflectionDrag | null | undefined
  ignoreDragStarts: string[] | null | undefined
  isEditing: boolean | null | undefined
}

export interface ParabolSearchQuery {
  id: string
  queryString: string | null | undefined
  statusFilters: TaskStatusEnum[] | null | undefined
}
