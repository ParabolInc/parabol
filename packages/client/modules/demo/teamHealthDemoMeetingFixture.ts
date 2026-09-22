import dayjs from 'dayjs'
import MeetingMemberId from '../../shared/gqlIds/MeetingMemberId'
import TeamMemberId from '../../shared/gqlIds/TeamMemberId'
import type {
  DemoMeeting,
  DemoMeetingMember,
  DemoPhase,
  DemoResponseStage,
  DemoResultStage,
  DemoTeamMember,
  DemoViewerMeetingMember,
  TeamHealthDemoMeetingResponse
} from './teamHealthDemoFixtureTypes'
import {TeamHealthDemo} from './teamHealthDemoIds'
import {
  type DemoTeammate,
  demoFacilitator,
  demoTeammateLookup,
  demoTeammates,
  demoViewer
} from './teamHealthDemoTeammates'
import {type DemoTopic, demoTopics} from './teamHealthDemoTopics'

const {MEETING_ID, TEAM_ID} = TeamHealthDemo
const ORG_ID = 'teamHealthDemoOrgId'
const CHECK_INTERVAL_DAYS = 14
const SORT_STEP = 1000

// the one seam for personalizing the demo: pass a real team name here once there is one to pass
export const DEFAULT_DEMO_TEAM_NAME = 'Orbit Squad'

export const getDemoDiscussionId = (topic: DemoTopic) => `teamHealthDemoDiscussion_${topic.id}`

const toUser = ({id, picture, preferredName}: DemoTeammate) => ({id, picture, preferredName})

const roundToTenth = (value: number) => Math.round(value * 10) / 10

const getScore = (topic: DemoTopic) =>
  roundToTenth(topic.answers.reduce((sum, answer) => sum + answer, 0) / topic.answers.length)

const emptyNotificationIntegration = {isActive: false, teamNotificationSettings: null}
// the rows only render with a provider, and the demo swaps their OAuth click for a preview dialog
const createVideoIntegration = (service: string) => ({
  isActive: false,
  cloudProvider: {
    id: `teamHealthDemo${service}Provider`,
    clientId: `teamHealthDemo${service}Client`
  }
})

const createResponseStage = (topic: DemoTopic): DemoResponseStage => ({
  __typename: 'TeamHealthResponseStage',
  id: `teamHealthDemoResponseStage:${topic.id}`,
  discussionId: getDemoDiscussionId(topic),
  isComplete: true,
  isNavigable: true,
  isNavigableByFacilitator: true,
  healthQuestion: {
    id: `teamHealthDemoQuestion:${topic.id}`,
    question: topic.question,
    description: topic.description,
    category: {id: topic.id, name: topic.name}
  },
  viewerResponse: {
    id: `teamHealthDemoResponse:${topic.id}:viewer`,
    score: topic.viewerAnswer,
    comment: topic.viewerComment
  }
})

const createResultStage = (topic: DemoTopic, idx: number, endedAt: string): DemoResultStage => ({
  __typename: 'TeamHealthResultStage',
  id: `teamHealthDemoResultStage:${topic.id}`,
  discussionId: getDemoDiscussionId(topic),
  isComplete: true,
  isNavigable: true,
  isNavigableByFacilitator: true,
  sortOrder: (idx + 1) * SORT_STEP,
  score: getScore(topic),
  respondentCount: topic.answers.length,
  spreadScores: topic.answers,
  scoreHistory: topic.priorScores.map((score, priorIdx) => ({
    score,
    endedAt: dayjs(endedAt)
      .subtract((topic.priorScores.length - priorIdx) * CHECK_INTERVAL_DAYS, 'day')
      .toISOString()
  })),
  meeting: {__typename: 'TeamHealthMeeting', id: MEETING_ID, endedAt},
  healthQuestion: {
    id: `teamHealthDemoQuestion:${topic.id}`,
    question: topic.question,
    category: {id: topic.id, name: topic.name}
  },
  responses: topic.paraphrasedComments.map(({author, text}, commentIdx) => ({
    id: `teamHealthDemoResponse:${topic.id}:${commentIdx}`,
    commentParaphrased: text,
    commentAuthor: author ? toUser(demoTeammateLookup[author]) : null
  }))
})

const createMeetingMember = (teammate: DemoTeammate, connectedAt: string): DemoMeetingMember => ({
  __typename: 'TeamHealthMeetingMember',
  id: MeetingMemberId.join(MEETING_ID, teammate.id),
  userId: teammate.id,
  isSpectating: false,
  isConnectedAt: connectedAt,
  user: {...toUser(teammate), email: teammate.email}
})

const createTeamMember = (teammate: DemoTeammate): DemoTeamMember => ({
  id: TeamMemberId.join(TEAM_ID, teammate.id),
  userId: teammate.id,
  user: {...toUser(teammate), email: teammate.email}
})

const viewerMeetingMember: DemoViewerMeetingMember = {
  __typename: 'TeamHealthMeetingMember',
  id: MeetingMemberId.join(MEETING_ID, demoViewer.id),
  isSpectating: false,
  user: toUser(demoViewer),
  teamMember: {
    id: TeamMemberId.join(TEAM_ID, demoViewer.id),
    isLead: false,
    isOrgAdmin: false,
    integrations: {
      id: `teamHealthDemoIntegrations:${demoViewer.id}`,
      mattermost: emptyNotificationIntegration,
      msTeams: emptyNotificationIntegration,
      slack: null
    }
  }
}

export const createTeamHealthDemoMeetingResponse = (
  teamName: string = DEFAULT_DEMO_TEAM_NAME
): TeamHealthDemoMeetingResponse => {
  const endedAt = dayjs().subtract(1, 'hour').toISOString()
  const createdAt = dayjs(endedAt).subtract(2, 'day').toISOString()
  const resultStages = demoTopics.map((topic, idx) => createResultStage(topic, idx, endedAt))
  const phases: DemoPhase[] = [
    {
      __typename: 'TeamHealthResponsePhase',
      id: 'teamHealthDemoResponsePhase',
      phaseType: 'TEAM_HEALTH_RESPONSE',
      stages: demoTopics.map(createResponseStage)
    },
    {
      __typename: 'TeamHealthResultPhase',
      id: 'teamHealthDemoResultPhase',
      phaseType: 'TEAM_HEALTH_RESULT',
      stages: resultStages
    }
  ]
  const meeting: DemoMeeting = {
    __typename: 'TeamHealthMeeting',
    __isNewMeeting: 'TeamHealthMeeting',
    id: MEETING_ID,
    meetingType: 'teamHealth',
    name: 'Team Health #5',
    createdAt,
    endedAt,
    locked: false,
    currentStreak: 5,
    respondentCount: demoTeammates.length,
    scheduledEndTime: null,
    summaryPageId: null,
    meetingSeriesId: null,
    meetingSeries: null,
    teamId: TEAM_ID,
    facilitatorUserId: demoFacilitator.id,
    facilitatorStageId: resultStages[0]!.id,
    facilitator: {
      id: TeamMemberId.join(TEAM_ID, demoFacilitator.id),
      user: toUser(demoFacilitator)
    },
    meetingMembers: demoTeammates.map((teammate, idx) =>
      createMeetingMember(teammate, dayjs(createdAt).add(idx, 'minute').toISOString())
    ),
    viewerMeetingMember,
    organization: {
      id: ORG_ID,
      name: teamName,
      isPaid: true,
      useAI: false,
      viewerOrganizationUser: null
    },
    team: {
      id: TEAM_ID,
      name: teamName,
      autoAssignFacilitator: false,
      facilitatorRotation: [],
      organization: {id: ORG_ID, tierLimitExceededAt: null},
      teamMembers: demoTeammates.map(createTeamMember),
      viewerTeamMember: {
        id: TeamMemberId.join(TEAM_ID, demoViewer.id),
        integrations: {
          id: `teamHealthDemoIntegrations:${demoViewer.id}`,
          gmeet: createVideoIntegration('Gmeet'),
          zoom: createVideoIntegration('Zoom')
        }
      }
    },
    template: {
      id: 'teamHealthDemoTemplate',
      availableQuestionPacks: [
        {
          id: 'teamHealthDemoQuestionPack',
          questions: demoTopics.map((topic, idx) => ({
            id: `teamHealthDemoQuestion:${topic.id}`,
            category: {
              id: topic.id,
              name: topic.name,
              createdAt: dayjs('2026-01-01').add(idx, 'minute').toISOString()
            }
          }))
        }
      ]
    },
    phases
  }
  return {viewer: {id: demoViewer.id, meeting}}
}
