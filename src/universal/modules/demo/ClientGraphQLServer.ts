import EventEmitter from 'eventemitter3'
import {Variables} from 'relay-runtime'
import unlockAllStagesForPhase from 'server/graphql/mutations/helpers/unlockAllStagesForPhase'
import StrictEventEmitter from 'strict-event-emitter-types'
import {
  CHECKIN,
  DISCUSS,
  GROUP,
  PRO,
  REFLECT,
  RETROSPECTIVE,
  TEAM,
  VOTE
} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import ICreateReflectionPayload = GQL.ICreateReflectionPayload
import IEditReflectionPayload = GQL.IEditReflectionPayload
import INewMeetingStage = GQL.INewMeetingStage
import IReflectPhase = GQL.IReflectPhase
import IRetroReflection = GQL.IRetroReflection
import IRetroReflectionGroup = GQL.IRetroReflectionGroup
import IRetrospectiveMeeting = GQL.IRetrospectiveMeeting
import IRetrospectiveMeetingSettings = GQL.IRetrospectiveMeetingSettings

// type Tables = 'users' | 'teamMembers' | 'meetingMembers' | 'newMeetings'

interface BaseUser {
  preferredName: string
  email: string
}

type PhaseId = 'checkinPhase' | 'reflectPhase' | 'groupPhase' | 'votePhase' | 'discussPhase'

interface DemoEvents {
  team: IEditReflectionPayload | ICreateReflectionPayload
}

type GQLDemoEmitter = {new (): StrictEventEmitter<EventEmitter, DemoEvents>}

const meetingId = 'demoMeeting'
const viewerId = 'demoUser'
const teamId = 'demoTeam'
const picture = '/static/images/avatars/avatar-user@3x.png'
const orgId = 'demoOrg'
const teamName = 'Demo Team'

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
    teamId,
    settingsId: 'settingsId',
    reflectTemplates: [],
    totalVotes: 5
  } as Partial<IRetrospectiveMeetingSettings>
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
    facilitatorUserId: id,
    facilitatorName: preferredName,
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

const initDemoMeetingMember = (user) => {
  return {
    __typename: 'RetrospectiveMeetingMember',
    id: toTeamMemberId(meetingId, user.id),
    isCheckedIn: true,
    meetingId,
    meetingType: RETROSPECTIVE,
    teamId,
    user,
    userId: user.id,
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

const initDemoTeam = (organization, teamMembers, newMeeting) => {
  return {
    __typename: 'Team',
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
  meetingId,
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
    facilitatorUserId: viewerId,
    facilitator: viewerMeetingMember.user,
    id: meetingId,
    meetingNumber: 1,
    meetingType: RETROSPECTIVE,
    meetingMember: viewerMeetingMember,
    meetingMembers,
    viewerMeetingMember,
    reflectionGroups: [],
    // settings: {
    //   meetingType: RETROSPECTIVE,
    //   totalVotes: 5,
    //   id: 'settingsId'
    // },
    nextAutoGroupThreshold: null,
    teamVotesRemaining: 15,
    phases: initPhases(teamMembers),
    summarySentAt: null,
    teamId
  } as Partial<IRetrospectiveMeeting>
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
  team.meetingSettings.team = team as any
  newMeeting.team = team as any
  newMeeting.teamId = team.id
  newMeeting.settings = team.meetingSettings as any
  return {
    meetingMembers,
    newMeeting,
    organization: org,
    reflections: [] as Array<Partial<IRetroReflection>>,
    reflectionGroups: [] as Array<Partial<IRetroReflectionGroup>>,
    team,
    teamMembers,
    users
  }
}

let tempID = 1
const getTempID = (prefix) => {
  return `${prefix}${tempID++}`
}

class ClientGraphQLServer extends (EventEmitter as GQLDemoEmitter) {
  db = initDB()
  ops = {
    RetroRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          team: this.db.team
        }
      }
    },
    CreateReflectionMutation: ({input: {content, retroPhaseItemId, sortOrder}}, userId) => {
      const now = new Date().toJSON()
      const reflectPhase = this.db.newMeeting.phases![1] as IReflectPhase
      const phaseItem = reflectPhase.reflectPrompts.find((prompt) => prompt.id === retroPhaseItemId)
      const reflectionGroupId = getTempID('refGroup')

      const reflection = {
        __typename: 'RetroReflection',
        id: getTempID('ref'),
        createdAt: now,
        creatorId: viewerId,
        content,
        editorIds: [],
        isActive: true,
        isViewerCreator: userId === viewerId,
        meetingId,
        phaseItem,
        reflectionGroupId,
        retroPhaseItemId,
        sortOrder: 0,
        updatedAt: now
      } as Partial<IRetroReflection>

      const reflectionGroup = {
        __typename: 'RetroReflectionGroup',
        id: reflectionGroupId,
        createdAt: now,
        isActive: true,
        meetingId,
        meeting: this.db.newMeeting,
        phaseItem,
        retroPhaseItemId,
        reflections: [reflection],
        sortOrder,
        tasks: [],
        updatedAt: now,
        voterIds: []
      } as Partial<IRetroReflectionGroup>

      reflection.retroReflectionGroup = reflectionGroup as any
      this.db.reflectionGroups.push(reflectionGroup)
      this.db.reflections.push(reflection)

      const unlockedStageIds = unlockAllStagesForPhase(
        this.db.newMeeting.phases,
        GROUP,
        true
      ) as Array<string>
      let unlockedStages = [] as Array<INewMeetingStage>
      this.db.newMeeting.phases!.forEach((phase) => {
        (phase.stages as any).forEach((stage) => {
          if (unlockedStageIds.includes(stage.id)) {
            unlockedStages.push(stage)
          }
        })
      })

      const data = {
        meetingId,
        reflection,
        reflectionId: reflection.id,
        reflectionGroupId,
        reflectionGroup,
        unlockedStageIds,
        unlockedStages,
        __typename: 'CreateReflectionPayload'
      }

      if (userId !== viewerId) {
        this.emit(TEAM, data)
      }
      return {createReflection: data}
    },
    EditReflectionMutation: (
      {phaseItemId, isEditing}: {phaseItemId: PhaseId; isEditing: boolean},
      userId
    ) => {
      const data = {
        phaseItemId,
        editorId: userId,
        isEditing,
        __typename: 'EditReflectionPayload'
      }
      if (userId !== viewerId) {
        this.emit(TEAM, data)
      }
      return {editReflection: data}
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
      data: resolve(variables, viewerId)
    }
  }

  publish (channel: keyof DemoEvents, data: any) {
    this.emit(channel, data)
  }
}

export default ClientGraphQLServer
