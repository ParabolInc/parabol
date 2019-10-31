import {
  INewMeeting,
  IRemoteReflectionDrag,
  IRetroPhaseItem,
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
}

export interface ClientRetroPhaseItem extends IRetroPhaseItem {
  editorIds: string[]
}

export interface ClientRetroReflection extends IRetroReflection {
  isViewerDragging: boolean
  isDropping: boolean
  remoteDrag: IRemoteReflectionDrag
  ignoreDragStarts: string[]
  isEditing: boolean
}
