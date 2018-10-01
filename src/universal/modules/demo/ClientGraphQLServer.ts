import {Variables} from 'relay-runtime'
import {CHECKIN, DISCUSS, GROUP, PRO, REFLECT, RETROSPECTIVE, VOTE} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

// type Tables = 'users' | 'teamMembers' | 'meetingMembers' | 'newMeetings'

interface BaseUser {
  preferredName: string
  email: string
}

const meetingId = 'demoMeeting'
const viewerId = 'demoUser'
const teamId = 'demoTeam'
const picture = '/static/images/avatars/avatar-user@3x.png'
const orgId = 'demoOrg'

const baseUsers = [
  {preferredName: 'You', email: 'demoUser@parabol.co'},
  {preferredName: 'Bot1', email: 'bot1@parabol.co'},
  {preferredName: 'Bot2', email: 'bot2@parabol.co'}
]

const initMeetingSettings = () => {
  return {
    __typename: 'RetrospectiveMeetingSettings',
    phaseTypes: [],
    id: 'settingsId',
    selectedTemplateId: 'templateId',
    teamId,
    settingsId: 'settingsId',
    reflectTemplates: [],
    totalVotes: 5
  }
}

const initDemoUser = ({preferredName, email}: BaseUser, idx: number) => {
  const now = new Date().toJSON()
  const id = idx === 0 ? viewerId : `bot${idx}`
  return {
    id,
    viewerId: id,
    connectedSockets: [`socket${idx}`],
    createdAt: now,
    email,
    inactive: false,
    lastLogin: now,
    lastSeenAt: now,
    // name: 'You',
    picture,
    preferredName,
    tms: [teamId]
  }
}

const initDemoTeamMember = ({id: userId, preferredName}, idx) => {
  const teamMemberId = toTeamMemberId(teamId, userId)
  return {
    id: teamMemberId,
    checkInOrder: idx,
    teamMemberId,
    isConnected: true,
    isFacilitator: idx === 0,
    isLead: idx === 0,
    isSelf: idx === 0,
    picture,
    preferredName,
    teamId,
    userId
  }
}

const initDemoMeetingMember = ({id: userId}) => {
  return {
    __typename: 'RetrospectiveMeetingMember',
    id: toTeamMemberId(meetingId, userId),
    isCheckedIn: true,
    meetingId,
    meetingType: RETROSPECTIVE,
    teamId,
    userId,
    votesRemaining: 5,
    myVotesRemaining: 5
  }
}

const initDemoOrg = () => {
  return {
    id: orgId,
    name: 'Demo Organization',
    retroMeetingsOffered: 3,
    retroMeetingsRemaining: 3,
    tier: PRO
  }
}

const teamName = 'Demo Team'
const initDemoTeam = (organization) => {
  return {
    id: teamId,
    isArchived: false,
    isPaid: true,
    meetingId,
    name: teamName,
    teamName,
    orgId,
    tier: PRO,
    teamId,
    organization,
    meetingSettings: initMeetingSettings()
  }
}

const initCheckInStage = (teamMember) => ({
  __typename: 'CheckInStage',
  endAt: new Date().toJSON(),
  id: 'checkinStage',
  isComplete: true,
  meetingId,
  phaseType: CHECKIN,
  teamMemberId: teamMember.id,
  teamMember
})

const initNewMeeting = (teamMembers, viewerMeetingMember) => {
  const now = new Date().toJSON()
  return {
    __typename: 'RetrospectiveMeeting',
    createdAt: now,
    facilitatorStageId: 'reflectStage',
    facilitatorUserId: viewerId,
    id: meetingId,
    meetingNumber: 1,
    meetingType: RETROSPECTIVE,
    meetingMember: viewerMeetingMember,
    viewerMeetingMember,
    reflectionGroups: [],
    settings: {
      maxVotesPerGroup: 3,
      totalVotes: 5,
      id: 'settingsId'
    },
    nextAutoGroupThreshold: null,
    teamVotesRemaining: 15,
    phases: [
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
            meetingId,
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
            meetingId,
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
            meetingId,
            phaseType: VOTE
          }
        ]
      },
      {
        __typename: 'DiscussPhase',
        id: 'discussPhase',
        phaseType: DISCUSS,
        stages: []
      }
    ],
    teamId
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
  return {
    users,
    teamMembers,
    meetingMembers,
    newMeetings: [initNewMeeting(teamMembers, meetingMembers[0])],
    organizations: [org],
    teams: [initDemoTeam(org)]
  }
}

class ClientGraphQLServer {
  db = initDB()
  ops = {
    RetroRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          team: {
            ...this.db.teams[0],
            teamMembers: this.db.teamMembers.map((teamMember, idx) => ({
              ...teamMember,
              meetingMember: this.db.meetingMembers[idx]
            })),
            newMeeting: {
              ...this.db.newMeetings[0]
            }
          }
        }
      }
    }
  }

  fetch (opName: string, variables: Variables) {
    const resolve = this.ops[opName]
    if (!resolve) {
      console.log('op not found', opName)
      return {
        errors: [{message: `op not found ${opName}`}]
      }
    }
    return {
      data: resolve(variables)
    }
  }

  subscribe () {
    /*noop*/
  }
}

export default ClientGraphQLServer
