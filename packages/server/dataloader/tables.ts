import {
  IAgendaItem,
  IAtlassianAuth,
  ICustomPhaseItem,
  INewFeatureBroadcast,
  IReflectTemplate,
  ITeam,
  ITeamMeetingSettings
} from 'parabol-client/types/graphql'
import Meeting from '../database/types/Meeting'
import MeetingMember from '../database/types/MeetingMember'
import Notification from '../database/types/Notification'
import Organization from '../database/types/Organization'
import OrganizationUser from '../database/types/OrganizationUser'
import Reflection from '../database/types/Reflection'
import ReflectionGroup from '../database/types/ReflectionGroup'
import SlackAuth from '../database/types/SlackAuth'
import SlackNotification from '../database/types/SlackNotification'
import SuggestedAction from '../database/types/SuggestedAction'
import Task from '../database/types/Task'
import TeamInvitation from '../database/types/TeamInvitation'
import TeamMember from '../database/types/TeamMember'
import User from '../database/types/User'
import MassInvitation from '../database/types/MassInvitation'

export interface Tables {
  AgendaItem: IAgendaItem
  AtlassianAuth: IAtlassianAuth
  CustomPhaseItem: ICustomPhaseItem
  MassInvitation: MassInvitation
  MeetingSettings: ITeamMeetingSettings
  MeetingMember: MeetingMember
  NewMeeting: Meeting
  NewFeature: INewFeatureBroadcast
  Notification: Notification
  Organization: Organization
  OrganizationUser: OrganizationUser
  ReflectTemplate: IReflectTemplate
  RetroReflectionGroup: ReflectionGroup
  RetroReflection: Reflection
  SlackAuth: SlackAuth
  SlackNotification: SlackNotification
  SuggestedAction: SuggestedAction
  Task: Task
  TeamMember: TeamMember
  TeamInvitation: TeamInvitation
  Team: ITeam
  User: User
}
