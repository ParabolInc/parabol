import {
  ICoords2D,
  IDragContext,
  INewMeeting,
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
  isViewerDragInProgress: Boolean
  localPhase: NewMeetingPhase
  localStage: NewMeetingStage
  reflectionsInFlight: Array<IRetroReflection>
}

export interface ClientDragContext extends IDragContext {
  isClosing: Boolean
  isPendingStartDrag: Boolean
  isViewerDragging: Boolean
  initialCursorCoords: ICoords2D
  initialComponentCoords: ICoords2D
}
