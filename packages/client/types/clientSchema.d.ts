import {
  ICoords2D,
  IDragContext,
  INewMeeting,
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
