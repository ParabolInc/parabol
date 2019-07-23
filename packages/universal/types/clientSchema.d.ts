import {
  ICoords2D,
  IDragContext,
  INewMeeting,
  IRetroPhaseItem,
  IRetroReflection,
  IRetrospectiveMeeting,
  NewMeetingPhase,
  NewMeetingStage
} from 'universal/types/graphql'

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

export interface ClientDragContext extends IDragContext {
  isClosing: boolean
  isPendingStartDrag: boolean
  isViewerDragging: boolean
  initialCursorCoords: ICoords2D
  initialComponentCoords: ICoords2D
}

export interface ClientRetroPhaseItem extends IRetroPhaseItem {
  editorIds: string[]
}
