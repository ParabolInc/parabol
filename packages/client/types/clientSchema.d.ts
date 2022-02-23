import {
  INewMeeting,
  IRemoteReflectionDrag,
  IRetroReflection,
  IRetrospectiveMeeting,
  NewMeetingPhase,
  NewMeetingStage
} from './graphql'

export interface ClientNewMeeting extends INewMeeting {
  localPhase: NewMeetingPhase
  localStage: NewMeetingStage
}

export interface ClientRetrospectiveMeeting extends IRetrospectiveMeeting {
  isViewerDragInProgress: boolean
  localPhase: NewMeetingPhase
  localStage: NewMeetingStage
  reflectionsInFlight: IRetroReflection[]
  highlightedTaskId?: string
}

export interface ClientReflectPrompt extends IReflectPrompt {
  editorIds: string[]
}

export interface ClientRetroReflection extends IRetroReflection {
  isViewerDragging: boolean
  isDropping: boolean
  remoteDrag: IRemoteReflectionDrag
  ignoreDragStarts: string[]
  isEditing: boolean
}

export interface ParabolSearchQuery {
  id: string
  queryString: string
  statusFilters: [TaskStatusEnum!]
}
