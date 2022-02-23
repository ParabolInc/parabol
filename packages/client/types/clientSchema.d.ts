export interface ClientRetroReflection {
  isViewerDragging: boolean
  isDropping: boolean
  remoteDrag: IRemoteReflectionDrag
  ignoreDragStarts: string[]
  isEditing: boolean
}

export interface ParabolSearchQuery {
  id: String!
  queryString: String
  statusFilters: [TaskStatusEnum!]
}
