import {CHECKIN, DISCUSS, GROUP, PRO, REFLECT, RETROSPECTIVE, VOTE} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {
  IRetroReflection,
  IRetroReflectionGroup,
  IRetrospectiveMeeting,
  IRetrospectiveMeetingSettings,
  ITask
} from '../../types/graphql'

export const demoMeetingId = 'demoMeeting'
export const demoViewerId = 'demoUser'
export const demoTeamId = 'demoTeam'
export const demoPictureURL = '/static/images/avatars/avatar-user@3x.png'
export const demoOrgId = 'demoOrg'
export const demoTeamName = 'Demo Team'

interface BaseUser {
  preferredName: string
  email: string
}

const baseUsers = [
  {preferredName: 'You', email: 'demoUser@parabol.co'},
  {preferredName: 'Bot1', email: 'bot1@parabol.co'},
  {preferredName: 'Bot2', email: 'bot2@parabol.co'}
]

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

const initDemoUser = ({preferredName, email}: BaseUser, idx: number) => {
  const now = new Date().toJSON()
  const id = idx === 0 ? demoViewerId : `bot${idx}`
  return {
    id,
    viewerId: id,
    connectedSockets: [`socket${idx}`],
    createdAt: now,
    email,
    facilitatorUserId: id,
    facilitatorName: preferredName,
    inactive: false,
    lastLogin: now,
    lastSeenAt: now,
    // name: 'You',
    picture: demoPictureURL,
    preferredName,
    tms: [demoTeamId]
  }
}

const initDemoTeamMember = ({id: userId, preferredName}, idx) => {
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
    picture: demoPictureURL,
    preferredName,
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
    retroMeetingsOffered: 3,
    retroMeetingsRemaining: 3,
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
      stages: teamMembers.map(initCheckInStage)
    },
    {
      __typename: 'ReflectPhase',
      id: 'reflectPhase',
      phaseType: REFLECT,
      focusedPhaseItemId: null,
      reflectPrompts: [
        {
          id: 'startId',
          retroPhaseItemId: 'startId',
          question: 'Start'
        },
        {
          id: 'stopId',
          retroPhaseItemId: 'stopId',
          question: 'Stop'
        },
        {
          id: 'continueId',
          retroPhaseItemId: 'continueId',
          question: 'Continue'
        }
      ],
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: 'reflectStage',
          isComplete: false,
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
  return {
    __typename: 'RetrospectiveMeeting',
    createdAt: now,
    endedAt: null,
    facilitatorStageId: 'reflectStage',
    facilitatorUserId: demoViewerId,
    facilitator: viewerMeetingMember.user,
    id: demoMeetingId,
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

const initBotScript = () => {
  return {
    reflectStage: [
      {
        op: 'EditReflectionMutation',
        delay: 1000,
        botId: 'bot1',
        variables: {
          phaseItemId: 'startId',
          isEditing: true
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 300,
        botId: 'bot2',
        variables: {
          phaseItemId: 'startId',
          isEditing: true
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          input: {
            content: `{"blocks":[{"key":"2t965","text":"I'd like to give our interns and junior staff more space to share their ideas & fresh thinking","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'startId',
            sortOrder: 0
          }
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          input: {
            content: `{"blocks":[{"key":"2t966","text":"Writing down our processes","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'startId',
            sortOrder: 0
          }
        }
      }
    ]
  }
}
const initDB = () => {
  const users = baseUsers.map(initDemoUser)
  const meetingMembers = users.map(initDemoMeetingMember)
  const teamMembers = users.map(initDemoTeamMember).map((teamMember, idx) => ({
    ...teamMember,
    meetingMember: meetingMembers[idx]
  }))
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
    reflections: [] as Array<Partial<IRetroReflection>>,
    reflectionGroups: newMeeting.reflectionGroups as Array<Partial<IRetroReflectionGroup>>,
    tasks: [] as Array<Partial<ITask>>,
    team,
    teamMembers,
    users,
    _updatedAt: new Date(),
    _tempID: 1,
    _botScript: initBotScript()
  }
}

export default initDB
