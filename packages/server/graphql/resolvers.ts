import findStageById from 'parabol-client/utils/meetings/findStageById'
import nullIfEmpty from 'parabol-client/utils/nullIfEmpty'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {NewMeetingPhaseTypeEnum} from '../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../database/types/GenericMeetingStage'
import Meeting from '../database/types/Meeting'
import Organization from '../database/types/Organization'
import Task from '../database/types/Task'
import TeamMember from '../database/types/TeamMember'
import User from '../database/types/User'
import {Loaders} from '../dataloader/RootDataLoader'
import {IGetTeamsByIdsQueryResult} from '../postgres/queries/generated/getTeamsByIdsQuery'
import {Team} from '../postgres/queries/getTeamsByIds'
import {AnyMeeting} from '../postgres/types/Meeting'
import {getUserId, isSuperUser, isUserBillingLeader} from '../utils/authorization'
import {GQLContext} from './graphql'
import isValid from './isValid'

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

export const resolveTasks = async (
  {taskIds}: {taskIds: string[]},
  _args: unknown,
  {authToken, dataLoader}: GQLContext
) => {
  if (!taskIds || taskIds.length === 0) return null
  const tasks = (await dataLoader.get('tasks').loadMany(taskIds)).filter(isValid)
  const {userId} = tasks[0]!
  const isViewer = userId === getUserId(authToken)
  const teamTasks = tasks.filter(({teamId}: {teamId: string}) => authToken.tms.includes(teamId))
  return isViewer
    ? teamTasks
    : nullIfEmpty(teamTasks.filter((p: Task) => !p.tags.includes('private')))
}

export const resolveTeam = (
  {team, teamId}: {teamId?: string; team?: IGetTeamsByIdsQueryResult},
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

export const resolveTeamMember = (
  {teamMemberId, teamMember}: {teamMemberId: string; teamMember: TeamMember},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  return teamMemberId ? dataLoader.get('teamMembers').load(teamMemberId) : teamMember
}

export const resolveTeamMembers = (
  {teamMemberIds, teamMembers}: {teamMemberIds: string; teamMembers: TeamMember[]},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  return teamMemberIds && teamMemberIds.length > 0
    ? dataLoader.get('teamMembers').loadMany(teamMemberIds)
    : teamMembers
}

export const resolveGQLStageFromId = (stageId: string | undefined, meeting: Meeting) => {
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
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
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
    return idValue ? (dataLoader.get(dataLoaderName)[method] as any)(idValue) : source[docName]
  }

export const resolveFilterByTeam =
  (
    resolver: (source: any, _args: any, context: GQLContext) => Promise<any>,
    getTeamId: (obj: any) => string
  ) =>
  async (source: any, _args: any, context: GQLContext) => {
    const {teamIdFilter} = source
    const resolvedArray = await resolver(source, _args, context)
    return teamIdFilter
      ? resolvedArray.filter((obj: any) => getTeamId(obj) === teamIdFilter)
      : resolvedArray
  }

export const resolveForBillingLeaders =
  (fieldName: string) =>
  async (source: any, _args: any, {authToken, dataLoader}: GQLContext) => {
    const {id: orgId} = source
    const viewerId = getUserId(authToken)
    const isBillingLeader = await isUserBillingLeader(viewerId, orgId, dataLoader)
    return isBillingLeader || isSuperUser(authToken) ? source[fieldName] : undefined
  }
