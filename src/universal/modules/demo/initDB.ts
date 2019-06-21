import {CHECKIN, DISCUSS, GROUP, PRO, REFLECT, RETROSPECTIVE, VOTE} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {
  IJiraRemoteProject,
  IRetroReflection,
  IRetroReflectionGroup,
  IRetrospectiveMeeting,
  IRetrospectiveMeetingSettings,
  ISuggestedIntegrationGitHub,
  ISuggestedIntegrationJira,
  ITask,
  SlackNotificationEventEnum,
  TaskServiceEnum
} from '../../types/graphql'
import getDemoAvatar from 'universal/utils/getDemoAvatar'
import demoUserAvatar from 'universal/styles/theme/images/avatar-user.svg'

export const demoMeetingId = 'demoMeeting'
export const demoViewerId = 'demoUser'
export const demoTeamId = 'demoTeam'
export const demoOrgId = 'demoOrg'
export const demoTeamName = 'Demo Team'

interface BaseUser {
  preferredName: string
  email: string
  picture: string
}

const initMeetingSettings = () => {
  return {
    __typename: 'RetrospectiveMeetingSettings',
    phaseTypes: [CHECKIN, REFLECT, GROUP, VOTE, DISCUSS],
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

export const JiraProjectKeyLookup = {
  [JiraDemoKey]: {
    projectKey: JiraDemoKey,
    projectName: 'Demo Jira Project',
    cloudId: '123',
    cloudName: JiraDemoCloudName,
    avatar: 'foo',
    service: TaskServiceEnum.jira
  },
  [JiraSecretKey]: {
    projectKey: JiraSecretKey,
    projectName: 'Secret Jira Project',
    cloudId: '123',
    cloudName: JiraDemoCloudName,
    avatar: 'foo',
    service: TaskServiceEnum.jira
  }
}

export const GitHubDemoKey = 'ParabolInc/ParabolDemo'
export const GitHubProjectKeyLookup = {
  [GitHubDemoKey]: {
    nameWithOwner: GitHubDemoKey,
    service: TaskServiceEnum.github
  }
}

const makeSuggestedIntegrationJira = (key): ISuggestedIntegrationJira => ({
  __typename: 'SuggestedIntegrationJira',
  id: key,
  remoteProject: {} as IJiraRemoteProject,
  ...JiraProjectKeyLookup[key]
})

const makeSuggestedIntegrationGitHub = (nameWithOwner): ISuggestedIntegrationGitHub => ({
  __typename: 'SuggestedIntegrationGitHub',
  id: nameWithOwner,
  ...GitHubProjectKeyLookup[nameWithOwner]
})

const initDemoUser = ({preferredName, email, picture}: BaseUser, idx: number) => {
  const now = new Date().toJSON()
  const id = idx === 0 ? demoViewerId : `bot${idx}`
  return {
    id,
    viewerId: id,
    atlassianAuth: {isActive: true, accessToken: '123'},
    githubAuth: {isActive: true, accessToken: '123'},
    connectedSockets: [`socket${idx}`],
    createdAt: now,
    email,
    featureFlags: {
      jira: false,
      video: false
    },
    facilitatorUserId: id,
    facilitatorName: preferredName,
    inactive: false,
    isConnected: true,
    lastLogin: now,
    lastSeenAt: now,
    // name: 'You',
    picture: picture,
    preferredName,
    suggestedIntegrations: {
      hasMore: true,
      items: [
        makeSuggestedIntegrationJira(JiraDemoKey),
        makeSuggestedIntegrationGitHub(GitHubDemoKey)
      ]
    },
    allAvailableIntegrations: [
      makeSuggestedIntegrationJira(JiraDemoKey),
      makeSuggestedIntegrationJira(JiraSecretKey)
    ],
    tms: [demoTeamId]
  }
}

const initSlackNotification = (userId) => ({
  __typename: 'SlackNotification',
  id: 'demoSlackNotification',
  event: SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT_START,
  eventType: 'team',
  channelId: 'demoChannelId',
  userId,
  teamId: demoTeamId
})

const initSlackAuth = (userId) => ({
  __typename: 'SlackAuth',
  isActive: true,
  accessToken: 'demoToken',
  botUserId: 'demoSlackBotId',
  botAccessToken: 'demoToken',
  defaultTeamChannelId: 'demoChannelId',
  teamId: demoTeamId,
  userId,
  slackTeamId: 'demoSlackTeamId',
  slackTeamName: 'demoTeam',
  slackUserId: 'demoUserId',
  slackUserName: 'Demo Slack User',
  id: 'demoSlackUser'
})

const initDemoTeamMember = ({id: userId, preferredName, picture}, idx) => {
  const teamMemberId = toTeamMemberId(demoTeamId, userId)
  return {
    __typename: 'TeamMember',
    email: 'you@parabol.co',
    id: teamMemberId,
    checkInOrder: idx,
    teamMemberId,
    isConnected: true,
    isFacilitator: idx === 0,
    isLead: idx === 0,
    isSelf: idx === 0,
    picture: picture,
    preferredName,
    slackAuth: initSlackAuth(userId),
    slackNotifications: [initSlackNotification(userId)],
    teamId: demoTeamId,
    userId
  }
}

const initDemoMeetingMember = (user) => {
  return {
    __typename: 'RetrospectiveMeetingMember',
    id: toTeamMemberId(demoMeetingId, user.id),
    isCheckedIn: true,
    meetingId: demoMeetingId,
    meetingType: RETROSPECTIVE,
    teamId: demoTeamId,
    tasks: [] as Array<ITask>,
    user,
    userId: user.id,
    votesRemaining: 5,
    myVotesRemaining: 5
  }
}

const initDemoOrg = () => {
  return {
    id: demoOrgId,
    name: 'Demo Organization',
    tier: PRO
  }
}

const initDemoTeam = (organization, teamMembers, newMeeting) => {
  return {
    __typename: 'Team',
    id: demoTeamId,
    isArchived: false,
    isPaid: true,
    meetingId: demoMeetingId,
    name: demoTeamName,
    teamName: demoTeamName,
    orgId: demoOrgId,
    softTeamMembers: [],
    tier: PRO,
    teamId: demoTeamId,
    organization,
    meetingSettings: initMeetingSettings(),
    teamMembers,
    newMeeting
  }
}

const initCheckInStage = (teamMember) => ({
  __typename: 'CheckInStage',
  endAt: new Date().toJSON(),
  id: 'checkinStage',
  isComplete: true,
  meetingId: demoMeetingId,
  phaseType: CHECKIN,
  teamMemberId: teamMember.id,
  teamMember
})

const initPhases = (teamMembers) => {
  const now = new Date().toJSON()
  return [
    {
      __typename: 'CheckInPhase',
      checkInGreeting: {
        content: 'Bonjour',
        language: 'french'
      },
      checkInQuestion:
        '{"blocks":[{"key":"1bm6m","text":"What’s got your attention today, and why?","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
      id: 'checkinPhase',
      phaseType: CHECKIN,
      meetingId: demoMeetingId,
      stages: teamMembers.map(initCheckInStage)
    },
    {
      __typename: 'ReflectPhase',
      id: 'reflectPhase',
      phaseType: REFLECT,
      focusedPhaseItemId: null,
      meetingId: demoMeetingId,
      reflectPrompts: [
        {
          id: 'startId',
          retroPhaseItemId: 'startId',
          question: 'Start',
          description: 'What new behaviors should we adopt?'
        },
        {
          id: 'stopId',
          retroPhaseItemId: 'stopId',
          question: 'Stop',
          description: 'What existing behaviors should we cease doing?'
        },
        {
          id: 'continueId',
          retroPhaseItemId: 'continueId',
          question: 'Continue',
          description: 'What current behaviors should we keep doing?'
        }
      ],
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: 'reflectStage',
          isComplete: false,
          isNavigable: true,
          isNavigableByFacilitator: true,
          meetingId: demoMeetingId,
          phaseType: REFLECT,
          startAt: now
        }
      ]
    },
    {
      __typename: 'GenericMeetingPhase',
      id: 'groupPhase',
      phaseType: GROUP,
      meetingId: demoMeetingId,
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: 'groupStage',
          isComplete: false,
          meetingId: demoMeetingId,
          phaseType: GROUP
        }
      ]
    },
    {
      __typename: 'GenericMeetingPhase',
      id: 'votePhase',
      phaseType: VOTE,
      meetingId: demoMeetingId,
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: 'voteStage',
          isComplete: false,
          meetingId: demoMeetingId,
          phaseType: VOTE
        }
      ]
    },
    {
      __typename: 'DiscussPhase',
      id: 'discussPhase',
      phaseType: DISCUSS,
      meetingId: demoMeetingId,
      stages: [
        {
          __typename: 'RetroDiscussStage',
          id: 'discussStage0',
          meetingId: demoMeetingId,
          isComplete: false,
          isNavigable: false,
          isNavigableByFacilitator: false,
          phaseType: DISCUSS,
          reflectionGroup: null,
          sortOrder: 0
        }
      ]
    }
  ]
}

const initNewMeeting = (teamMembers, meetingMembers) => {
  const now = new Date().toJSON()
  const [viewerMeetingMember] = meetingMembers
  const [viewerTeamMember] = teamMembers
  return {
    __typename: 'RetrospectiveMeeting',
    createdAt: now,
    endedAt: null,
    facilitatorStageId: 'reflectStage',
    facilitatorUserId: demoViewerId,
    facilitator: viewerTeamMember,
    id: demoMeetingId,
    // alias is important for relay to normalize records correctly. if not supplied, value will be null
    meetingId: demoMeetingId,
    meetingNumber: 1,
    meetingType: RETROSPECTIVE,
    meetingMember: viewerMeetingMember,
    meetingMembers,
    nextAutoGroupThreshold: null,
    viewerMeetingMember,
    reflectionGroups: [],
    votesRemaining: teamMembers.length * 5,
    teamVotesRemaining: teamMembers.length * 5,
    phases: initPhases(teamMembers),
    summarySentAt: null,
    teamId: demoTeamId
  } as Partial<IRetrospectiveMeeting>
}

const initDB = (botScript) => {
  const baseUsers = [
    {
      preferredName: 'You',
      email: 'demo-user@example.co',
      picture: demoUserAvatar
    },
    getDemoAvatar(1),
    getDemoAvatar(2)
  ]
  const users = baseUsers.map(initDemoUser)
  const meetingMembers = users.map(initDemoMeetingMember)
  const teamMembers = users.map(initDemoTeamMember).map((teamMember, idx) => ({
    ...teamMember,
    meetingMember: meetingMembers[idx],
    user: users[idx]
  }))
  users.forEach((user, idx) => {
    (user as any).teamMember = teamMembers[idx]
  })
  const org = initDemoOrg()
  const newMeeting = initNewMeeting(teamMembers, meetingMembers)
  const team = initDemoTeam(org, teamMembers, newMeeting)
  teamMembers.forEach((teamMember) => {
    (teamMember as any).team = team
  })
  team.meetingSettings.team = team as any
  newMeeting.team = team as any
  newMeeting.teamId = team.id
  newMeeting.settings = team.meetingSettings as any
  return {
    meetingMembers,
    newMeeting,
    organization: org,
    reflections: [] as Array<Partial<IRetroReflection & {isHumanTouched: boolean}>>,
    reflectionGroups: newMeeting.reflectionGroups as Array<Partial<IRetroReflectionGroup>>,
    tasks: [] as Array<Partial<ITask>>,
    team,
    teamMembers,
    users,
    _updatedAt: new Date(),
    _tempID: 1,
    _botScript: botScript
  }
}

export default initDB
