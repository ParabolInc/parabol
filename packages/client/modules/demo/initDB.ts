import {PALETTE} from '~/styles/paletteV3'
import {SlackNotificationEventEnum} from '~/__generated__/SlackNotificationList_viewer.graphql'
import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'
import RetrospectiveMeeting from '../../../server/database/types/MeetingRetrospective'
import RetrospectiveMeetingSettings from '../../../server/database/types/MeetingSettingsRetrospective'
import ITask from '../../../server/database/types/Task'
import JiraProjectId from '../../shared/gqlIds/JiraProjectId'
import demoUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {ExternalLinks, MeetingSettingsThreshold, RetroDemo} from '../../types/constEnums'
import {DISCUSS, GROUP, REFLECT, RETROSPECTIVE, VOTE} from '../../utils/constants'
import getDemoAvatar from '../../utils/getDemoAvatar'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import normalizeRawDraftJS from '../../validation/normalizeRawDraftJS'
import {DemoReflection, DemoReflectionGroup, DemoTask} from './ClientGraphQLServer'
import DemoDiscussStage from './DemoDiscussStage'
import DemoGenericMeetingStage from './DemoGenericMeetingStage'
import DemoUser from './DemoUser'
import initBotScript from './initBotScript'

export const demoViewerId = 'demoUser'
export const demoTeamId = 'demoTeam'
export const demoOrgId = 'demoOrg'
export const demoTeamName = 'Demo Team'

type IRetrospectiveMeeting = Omit<
  RetrospectiveMeeting,
  'summarySentAt' | 'createdAt' | 'endedAt'
> & {
  __typename: string
  createdAt: string | Date
  endedAt: string | Date | null
  meetingMembers: any
  team: any
  settings: any
  summarySentAt: string | Date | null
  votesRemaining: number
}

type IRetrospectiveMeetingSettings = RetrospectiveMeetingSettings & {
  team: any
}

const initMeetingSettings = () => {
  return {
    __typename: 'RetrospectiveMeetingSettings',
    phaseTypes: [REFLECT, GROUP, VOTE, DISCUSS],
    id: 'settingsId',
    maxVotesPerGroup: 3,
    meetingType: RETROSPECTIVE,
    selectedTemplateId: 'templateId',
    teamId: demoTeamId,
    settingsId: 'settingsId',
    reflectTemplates: [],
    totalVotes: 5
  } as Partial<IRetrospectiveMeetingSettings>
}

export const JiraDemoKey = 'Demo'
export const JiraDemoCloudName = 'jira-demo'
const JiraSecretKey = 'jira-secret'
const JiraDemoProjectId = '123:Demo'
const JiraSecretProjectId = '123:jira-secret'

export const JiraProjectKeyLookup = {
  [JiraDemoProjectId]: {
    key: JiraDemoKey,
    name: 'Demo Jira Project',
    cloudId: '123',
    cloudName: JiraDemoCloudName,
    projectId: JiraDemoProjectId,
    avatar: 'foo',
    service: 'jira'
  },
  [JiraSecretProjectId]: {
    key: JiraSecretKey,
    name: 'Secret Jira Project',
    cloudId: '123',
    projectId: JiraSecretProjectId,
    cloudName: JiraDemoCloudName,
    avatar: 'foo',
    service: 'jira'
  }
} as const

class DemoJiraRemoteProject {
  __typename = 'JiraRemoteProject'
  id: string
  teamId: string
  userId: string
  self = ''
  cloudId: string
  key: string
  name: string
  avatar: string
  avatarUrls = {
    x16: '',
    x24: '',
    x32: '',
    x48: ''
  }
  simplified = true
  style = ''
  constructor(key: keyof typeof JiraProjectKeyLookup) {
    const details = JiraProjectKeyLookup[key]
    const {key: projectKey, name, cloudId, avatar} = details
    this.id = JiraProjectId.join(cloudId, projectKey)
    this.teamId = RetroDemo.TEAM_ID
    this.userId = demoViewerId
    this.cloudId = cloudId
    this.key = projectKey
    this.name = name
    this.avatar = avatar
  }
}
export const GitHubDemoKey = 'ParabolInc/ParabolDemo'
export const GitHubProjectKeyLookup = {
  [GitHubDemoKey]: {
    nameWithOwner: GitHubDemoKey,
    service: 'github'
  }
}

const makeRepoIntegrationGitHub = (nameWithOwner: keyof typeof GitHubProjectKeyLookup) => ({
  __typename: '_xGitHubRepository',
  id: `si:${nameWithOwner}`,
  ...GitHubProjectKeyLookup[nameWithOwner]
})

const initSlackNotification = (userId: string) => ({
  __typename: 'SlackNotification',
  id: 'demoSlackNotification',
  event: 'MEETING_STAGE_TIME_LIMIT_START' as SlackNotificationEventEnum,
  eventType: 'team',
  channelId: 'demoChannelId',
  userId,
  teamId: demoTeamId
})

const initSlackAuth = (userId: string) => ({
  __typename: 'SlackAuth',
  isActive: true,
  botUserId: 'demoSlackBotId',
  botAccessToken: 'demoToken',
  defaultTeamChannelId: 'demoChannelId',
  teamId: demoTeamId,
  userId,
  slackTeamId: 'demoSlackTeamId',
  slackTeamName: 'demoTeam',
  slackUserId: 'demoUserId',
  slackUserName: 'Demo Slack User',
  id: 'demoSlackUser',
  notifications: [initSlackNotification(userId)]
})

class DemoGitLabCloudProvider {
  id = 'demoGitLabCloudProvider'

  teamId = demoTeamId
  createdAt = new Date().toJSON()
  updatedAt = new Date().toJSON()
  service = 'gitlab'
  authStrategy = 'oauth2'
  scope = 'global'
  isActive = true
  serverBaseUrl = ExternalLinks.INTEGRATIONS_GITLAB
  clientId = '123'
}

const demoGitLabCloudProvider = new DemoGitLabCloudProvider()

class DemoMattermostProvider {
  id = 'demoMattermostProvider'

  teamId = demoTeamId
  createdAt = new Date().toJSON()
  updatedAt = new Date().toJSON()
  service = 'gitlab'
  authStrategy = 'webhook'
  scope = 'team'
  isActive = true
  webhookUrl = ExternalLinks.INTEGRATIONS_MATTERMOST
}

class DemoMsTeamsProvider {
  id = 'demoMsTeamsProvider'

  teamId = demoTeamId
  createdAt = new Date().toJSON()
  updatedAt = new Date().toJSON()
  service = 'msTeams'
  authStrategy = 'webhook'
  scope = 'team'
  isActive = true
  webhookUrl = ExternalLinks.INTEGRATIONS_MSTEAMS
}

const demoMattermostProvider = new DemoMattermostProvider()
const demoMsTeamsProvider = new DemoMsTeamsProvider()

const initDemoTeamMember = (
  {id: userId, preferredName, picture}: {id: string; preferredName: string; picture: string},
  idx: number
) => {
  const teamMemberId = toTeamMemberId(demoTeamId, userId)
  return {
    __typename: 'TeamMember',
    email: 'you@parabol.co',
    id: teamMemberId,
    teamMemberId,
    isLead: idx === 0,
    isSelf: idx === 0,
    picture: picture,
    preferredName,
    integrations: {
      id: 'demoTeamIntegrations',
      atlassian: {id: 'demoTeamAtlassianIntegration', isActive: true, accessToken: '123'},
      github: {id: 'demoTeamGitHubIntegration', isActive: true, accessToken: '123'},
      gitlab: {
        id: 'demoTeamGitLabIntegration',
        auth: {
          id: 'demoGitLabAuth',
          teamId: demoTeamId,
          createdAt: new Date().toJSON(),
          updatedAt: new Date().toJSON(),
          providerId: demoGitLabCloudProvider.id,
          service: 'gitlab',
          isActive: true,
          provider: demoGitLabCloudProvider,
          accessToken: '123',
          scopes: 'demoScope'
        },
        cloudProvider: null,
        sharedProviders: []
      },
      mattermost: {
        id: 'demoMattermostIntegration',
        auth: {
          id: 'demoMattermostAuth',
          teamId: demoTeamId,
          createdAt: new Date().toJSON(),
          updatedAt: new Date().toJSON(),
          providerId: 'demoMattermostProvider',
          service: 'mattermost',
          isActive: true,
          provider: demoMattermostProvider
        },
        sharedProviders: []
      },
      msTeams: {
        id: 'demoMsTeamsIntegration',
        auth: {
          id: 'demoMsTeamsAuth',
          isActive: true,
          provider: demoMsTeamsProvider
        }
      },
      slack: initSlackAuth(userId)
    },
    repoIntegrations: {
      hasMore: true,
      items: [
        new DemoJiraRemoteProject(JiraDemoProjectId),
        makeRepoIntegrationGitHub(GitHubDemoKey)
      ]
    },
    allAvailableRepoIntegrations: [
      new DemoJiraRemoteProject(JiraDemoProjectId),
      new DemoJiraRemoteProject(JiraSecretProjectId)
    ],
    teamId: demoTeamId,
    userId
  }
}

const initDemoMeetingMember = (user: DemoUser) => {
  return {
    __typename: 'RetrospectiveMeetingMember',
    id: toTeamMemberId(RetroDemo.MEETING_ID, user.id),
    meetingId: RetroDemo.MEETING_ID,
    meetingType: RETROSPECTIVE,
    teamId: demoTeamId,
    teamMember: initDemoTeamMember(user, 0),
    tasks: [] as ITask[],
    user,
    userId: user.id,
    votesRemaining: 5
  }
}

const initDemoOrg = () => {
  return {
    id: demoOrgId,
    name: 'Demo Organization',
    tier: 'pro',
    orgUserCount: {
      activeUserCount: 5,
      inactiveUserCount: 0
    },
    showConversionModal: false
  } as const
}

const initDemoTeam = (
  organization: ReturnType<typeof initDemoOrg>,
  teamMembers: ReturnType<typeof initDemoTeamMember>[],
  newMeeting: ReturnType<typeof initNewMeeting>
) => {
  return {
    __typename: 'Team',
    id: demoTeamId,
    isArchived: false,
    isPaid: true,
    activeMeetings: [newMeeting],
    agendaItems: [],
    massInviteToken: '42',
    name: demoTeamName,
    teamName: demoTeamName,
    orgId: demoOrgId,
    tier: 'pro' as TierEnum,
    teamId: demoTeamId,
    organization,
    meetingSettings: initMeetingSettings(),
    teamMembers
  }
}

const initPhases = () => {
  const reflectStage = new DemoGenericMeetingStage(RetroDemo.REFLECT_STAGE_ID, REFLECT)
  reflectStage.isNavigable = true
  reflectStage.isNavigableByFacilitator = true
  const groupStage = new DemoGenericMeetingStage(RetroDemo.GROUP_STAGE_ID, GROUP)
  groupStage.isNavigableByFacilitator = true
  return [
    {
      __typename: 'ReflectPhase',
      __isNewMeetingPhase: 'ReflectPhase',
      id: 'reflectPhase',
      phaseType: REFLECT,
      focusedPromptId: null,
      meetingId: RetroDemo.MEETING_ID,
      teamId: demoTeamId,
      reflectPrompts: [
        {
          id: 'startId',
          promptId: 'startId',
          question: 'Start',
          description: 'What new behaviors should we adopt?',
          groupColor: PALETTE.JADE_400,
          sortOrder: 0
        },
        {
          id: 'stopId',
          promptId: 'stopId',
          question: 'Stop',
          description: 'What existing behaviors should we cease doing?',
          groupColor: PALETTE.TOMATO_500,
          sortOrder: 1
        },
        {
          id: 'continueId',
          promptId: 'continueId',
          question: 'Continue',
          description: 'What current behaviors should we keep doing?',
          groupColor: PALETTE.SKY_500,
          sortOrder: 2
        }
      ],
      stages: [reflectStage]
    },
    {
      __typename: 'GenericMeetingPhase',
      __isNewMeetingPhase: 'GenericMeetingPhase',
      id: 'groupPhase',
      phaseType: GROUP,
      meetingId: RetroDemo.MEETING_ID,
      stages: [groupStage]
    },
    {
      __typename: 'GenericMeetingPhase',
      __isNewMeetingPhase: 'GenericMeetingPhase',
      id: 'votePhase',
      phaseType: VOTE,
      meetingId: RetroDemo.MEETING_ID,
      stages: [new DemoGenericMeetingStage(RetroDemo.VOTE_STAGE_ID, VOTE)]
    },
    {
      __typename: 'DiscussPhase',
      __isNewMeetingPhase: 'DiscussPhase',
      id: 'discussPhase',
      phaseType: DISCUSS,
      meetingId: RetroDemo.MEETING_ID,
      stages: [new DemoDiscussStage('discussStage0', 0, null, 'discussion:dummy', null)]
    }
  ]
}

export class DemoComment {
  __typename = 'Comment'
  __isThreadable = 'Comment'
  content: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  createdByUserNullable: DemoUser | null
  id: string
  isActive = true
  isViewerComment: boolean
  meetingId = RetroDemo.MEETING_ID
  reactjis = []
  replies = []
  threadParentId: string | null
  threadSortOrder: number
  discussionId: string
  constructor(
    {
      id,
      threadSortOrder,
      content,
      isAnonymous,
      userId,
      threadParentId,
      discussionId
    }: {
      id: string
      threadSortOrder: number
      content: string
      isAnonymous: boolean
      userId: string
      threadParentId: string
      discussionId: string
    },
    db: RetroDemoDB
  ) {
    this.content = normalizeRawDraftJS(content)
    this.createdAt = new Date().toJSON()
    this.updatedAt = new Date().toJSON()
    this.createdBy = isAnonymous ? null : userId
    this.createdByUserNullable = isAnonymous ? null : db.users.find(({id}) => id === userId)!
    this.id = id
    this.discussionId = discussionId
    this.isViewerComment = userId === demoViewerId
    this.threadParentId = threadParentId || null
    this.threadSortOrder = threadSortOrder
  }
}

export class DemoThreadableEdge {
  __typename = 'ThreadableEdge'
  cursor: string
  node: DemoComment | DemoTask
  constructor(node: DemoComment | DemoTask) {
    this.node = node
    this.cursor = String(node.createdAt)
  }
}
export class DemoDiscussionThread {
  pageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: ''
  }
  edges = [] as DemoThreadableEdge[]
}

export class DemoDiscussion {
  teamId = demoTeamId
  meetingId = RetroDemo.MEETING_ID
  commentors = [] as DemoUser[]
  discussionTopicType = 'reflectionGroup'
  discussionTopicId: string
  createdAt: string
  id: string
  thread = new DemoDiscussionThread()
  commentCount = 0
  constructor(reflectionGroupId: string) {
    this.createdAt = new Date().toJSON()
    this.id = `discussion:${reflectionGroupId}`
    this.discussionTopicId = reflectionGroupId
  }
}

const initNewMeeting = (
  organization: ReturnType<typeof initDemoOrg>,
  teamMembers: ReturnType<typeof initDemoTeamMember>[],
  meetingMembers: ReturnType<typeof initDemoMeetingMember>[]
) => {
  const now = new Date().toJSON()
  const [viewerMeetingMember] = meetingMembers
  const [viewerTeamMember] = teamMembers
  return {
    __typename: 'RetrospectiveMeeting',
    __isNewMeeting: 'RetrospectiveMeeting',
    createdAt: now,
    createdBy: demoViewerId,
    endedAt: null,
    facilitatorStageId: RetroDemo.REFLECT_STAGE_ID,
    facilitatorUserId: demoViewerId,
    facilitator: viewerTeamMember,
    id: RetroDemo.MEETING_ID,
    // alias is important for relay to normalize records correctly. if not supplied, value will be null
    meetingId: RetroDemo.MEETING_ID,
    meetingNumber: 1,
    meetingType: RETROSPECTIVE,
    meetingMember: viewerMeetingMember,
    name: 'Retro Meeting',
    organization,
    showConversionModal: false,
    meetingMembers,
    nextAutoGroupThreshold: null,
    viewerMeetingMember,
    reflectionGroups: [] as any[],
    votesRemaining: teamMembers.length * 5,
    phases: initPhases() as any[],
    summarySentAt: null,
    totalVotes: MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
    maxVotesPerGroup: MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT,
    teamId: demoTeamId
  } as Partial<IRetrospectiveMeeting>
}

type BaseUser = {
  preferredName: string
  email: string
  picture: string
}

const initDB = (botScript: ReturnType<typeof initBotScript>) => {
  const baseUsers = [
    {
      preferredName: 'You',
      email: 'demo-user@example.co',
      picture: demoUserAvatar
    },
    getDemoAvatar(1),
    getDemoAvatar(2)
  ] as BaseUser[]
  const users = baseUsers.map(
    ({preferredName, email, picture}, idx) => new DemoUser(preferredName, email, picture, idx)
  )
  const meetingMembers = users.map(initDemoMeetingMember)
  const teamMembers = users.map(initDemoTeamMember).map((teamMember, idx) => ({
    ...teamMember,
    meetingMember: meetingMembers[idx],
    user: users[idx]
  }))
  users.forEach((user, idx) => {
    ;(user as any).teamMember = teamMembers[idx]
  })
  const org = initDemoOrg()
  const newMeeting = initNewMeeting(org, teamMembers, meetingMembers)
  const team = initDemoTeam(org, teamMembers, newMeeting)
  teamMembers.forEach((teamMember) => {
    ;(teamMember as any).team = team
  })
  team.meetingSettings.team = team as any
  newMeeting.commentCount = 0
  newMeeting.reflectionCount = 0
  newMeeting.taskCount = 0
  newMeeting.team = team as any
  newMeeting.teamId = team.id
  newMeeting.topicCount = 0
  newMeeting.settings = team.meetingSettings as any
  return {
    discussions: [] as DemoDiscussion[],
    meetingMembers,
    newMeeting,
    organization: org,
    comments: [] as DemoComment[],
    reflections: [] as DemoReflection[],
    reflectionGroups: (newMeeting as any).reflectionGroups as DemoReflectionGroup[],
    tasks: [] as DemoTask[],
    team,
    teamMembers,
    users,
    _started: false,
    _updatedAt: new Date(),
    _tempID: 1,
    _botScript: botScript
  }
}

export type RetroDemoDB = ReturnType<typeof initDB>
export default initDB
