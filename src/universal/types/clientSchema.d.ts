import IRetrospectiveMeeting = GQL.IRetrospectiveMeeting
import NewMeetingPhase = GQL.NewMeetingPhase
import NewMeetingStage = GQL.NewMeetingStage
import IRetroReflection = GQL.IRetroReflection
import INewMeeting = GQL.INewMeeting

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
