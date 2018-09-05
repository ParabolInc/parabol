import ICoords2D = GQL.ICoords2D
import IDragContext = GQL.IDragContext
import INewMeeting = GQL.INewMeeting
import IRetroReflection = GQL.IRetroReflection
import IRetrospectiveMeeting = GQL.IRetrospectiveMeeting
import NewMeetingPhase = GQL.NewMeetingPhase
import NewMeetingStage = GQL.NewMeetingStage

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
