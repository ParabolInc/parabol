import findStageById from 'parabol-client/utils/meetings/findStageById'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import type {NewMeetingPhaseTypeEnum} from '../database/types/GenericMeetingPhase'
import type GenericMeetingStage from '../database/types/GenericMeetingStage'
import type Organization from '../database/types/Organization'
import type {Loaders} from '../dataloader/RootDataLoader'
import type {Task, Team, User} from '../postgres/types'
import type {AnyMeeting} from '../postgres/types/Meeting'
import {getUserId, isSuperUser} from '../utils/authorization'
import type {GQLContext} from './graphql'

export const resolveNewMeeting = (
  {
    meeting,
    meetingId
  }: {
    meetingId: string
    meeting: AnyMeeting
  },
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  return meetingId ? dataLoader.get('newMeetings').load(meetingId) : meeting
}

export const resolveMeetingMember = (
  {meetingId, userId}: {meetingId: string; userId: string},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  if (!meetingId || !userId) return null
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  return dataLoader.get('meetingMembers').load(meetingMemberId)
}

export const resolveOrganization = (
  {orgId, organization}: {orgId: string; organization: Organization},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  return orgId ? dataLoader.get('organizations').load(orgId) : organization
}

export const resolveTask = async (
  {task, taskId}: {taskId: string; task?: Task | null},
  _args: unknown,
  {authToken, dataLoader}: GQLContext
) => {
  const taskDoc = taskId ? await dataLoader.get('tasks').load(taskId) : task
  if (!taskDoc) return null
  const {userId, tags, teamId} = taskDoc
  const isViewer = userId === getUserId(authToken)
  const isViewerOnTeam = authToken.tms.includes(teamId)
  return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
}

export const resolveTeam = (
  {team, teamId}: {teamId?: string; team?: Team},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  // TODO figure out how to lock this down without using the tms, since the mutation may have invalidated it
  return teamId ? dataLoader.get('teams').load(teamId) : team
  // const teamDoc = teamId ? await dataLoader.get('teams').load(teamId) : team;
  // const {tms} = authToken;
  // return tms.includes(teamDoc.id) ? teamDoc : null;
}

export const resolveTeams = (
  {teamIds, teams}: {teamIds: string; teams: Team[]},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  // TODO figure out how to lock this down without using the tms, since the mutation may have invalidated it
  return teamIds && teamIds.length > 0 ? dataLoader.get('teams').loadMany(teamIds) : teams
  // const {tms} = authToken;
  // const teamDocs = (teamIds && teamIds.length > 0) ? await dataLoader.get('teams').loadMany(teamIds) : teams;
  // return Array.isArray(teamDocs) ? teamDocs.filter((team) => tms.includes(team.id)) : null;
}

export const resolveGQLStageFromId = (stageId: string | undefined, meeting: AnyMeeting) => {
  const {id: meetingId, phases} = meeting
  const stageRes = findStageById(phases, stageId)
  if (!stageRes) return undefined
  const {stage} = stageRes
  return {
    ...stage,
    meetingId
  }
}

export const augmentDBStage = (
  stage: GenericMeetingStage,
  meetingId: string,
  phaseType: NewMeetingPhaseTypeEnum,
  teamId: string
) => ({
  ...stage,
  meetingId,
  phaseType,
  teamId
})

export const resolveGQLStagesFromPhase = ({
  meetingId,
  phaseType,
  stages,
  teamId
}: {
  meetingId: string
  phaseType: NewMeetingPhaseTypeEnum
  stages: GenericMeetingStage[]
  teamId: string
}) => {
  return stages.map((stage) => augmentDBStage(stage, meetingId, phaseType, teamId))
}

export const resolveUnlockedStages = async (
  {meetingId, unlockedStageIds}: {meetingId: string; unlockedStageIds: string[]},
  _args: any,
  {dataLoader}: GQLContext
) => {
  if (!unlockedStageIds || unlockedStageIds.length === 0 || !meetingId) return undefined
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  return unlockedStageIds.map((stageId) => resolveGQLStageFromId(stageId, meeting))
}

export const resolveUser = (
  {userId, user}: {userId: string; user: User},
  _args: any,
  {dataLoader}: GQLContext
) => {
  return userId ? dataLoader.get('users').load(userId) : user
}

/* Special resolvers */

export const resolveForSU =
  (fieldName: string) =>
  (source: any, _args: any, {authToken}: GQLContext) => {
    return isSuperUser(authToken) ? source[fieldName] : undefined
  }

export const makeResolve =
  (idName: string, docName: string, dataLoaderName: Loaders, isMany?: boolean) =>
  (source: any, _args: any, {dataLoader}: GQLContext) => {
    const idValue = source[idName]
    const method = isMany ? 'loadMany' : 'load'
    return idValue ? (dataLoader as any).get(dataLoaderName)[method](idValue) : source[docName]
  }
