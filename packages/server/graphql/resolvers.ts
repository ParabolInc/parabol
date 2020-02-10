import {getUserId, isSuperUser, isUserBillingLeader} from '../utils/authorization'
import nullIfEmpty from '../../client/utils/nullIfEmpty'
import toTeamMemberId from '../../client/utils/relay/toTeamMemberId'
import findStageById from '../../client/utils/meetings/findStageById'

export const resolveAgendaItem = ({agendaItemId, agendaItem}, _args, {dataLoader}) => {
  return agendaItemId ? dataLoader.get('agendaItems').load(agendaItemId) : agendaItem
}

export const resolveNewMeeting = ({meeting, meetingId}, _args, {dataLoader}) => {
  return meetingId ? dataLoader.get('newMeetings').load(meetingId) : meeting
}

export const resolveNotification = ({notificationId, notification}, _args, {dataLoader}) => {
  return notificationId ? dataLoader.get('notifications').load(notificationId) : notification
}

export const makeResolveNotificationsForViewer = (idArray, docArray) => async (
  source,
  _args,
  {authToken, dataLoader}
) => {
  const notificationIds = source[idArray]
  const notifications = source[docArray]
  const notificationDocs =
    notificationIds && notificationIds.length > 0
      ? await dataLoader.get('notifications').loadMany(notificationIds)
      : notifications
  const viewerId = getUserId(authToken)
  if (!notificationDocs) return null
  const viewerNotifications = notificationDocs.filter((n) => n.userIds.includes(viewerId))
  return nullIfEmpty(viewerNotifications)
}

export const resolveMeetingMember = ({meetingId, userId}, _args, {dataLoader}) => {
  if (!meetingId || !userId) return null
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  return dataLoader.get('meetingMembers').load(meetingMemberId)
}

export const resolveOrganization = ({orgId, organization}, _args, {dataLoader}) => {
  return orgId ? dataLoader.get('organizations').load(orgId) : organization
}

export const resolveTask = async ({task, taskId}, _args, {authToken, dataLoader}) => {
  const taskDoc = taskId ? await dataLoader.get('tasks').load(taskId) : task
  if (!taskDoc) return null
  const {userId, tags, teamId} = taskDoc
  const isViewer = userId === getUserId(authToken)
  const isViewerOnTeam = authToken.tms.includes(teamId)
  return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
}

export const resolveTasks = async ({taskIds}, _args, {authToken, dataLoader}) => {
  if (!taskIds || taskIds.length === 0) return null
  const tasks = await dataLoader.get('tasks').loadMany(taskIds)
  const {userId} = tasks[0]
  const isViewer = userId === getUserId(authToken)
  const teamTasks = tasks.filter(({teamId}) => authToken.tms.includes(teamId))
  return isViewer ? teamTasks : nullIfEmpty(teamTasks.filter((p) => !p.tags.includes('private')))
}

export const resolveTeam = ({team, teamId}, _args, {dataLoader}) => {
  // TODO figure out how to lock this down without using the tms, since the mutation may have invalidated it
  return teamId ? dataLoader.get('teams').load(teamId) : team
  // const teamDoc = teamId ? await dataLoader.get('teams').load(teamId) : team;
  // const {tms} = authToken;
  // return tms.includes(teamDoc.id) ? teamDoc : null;
}

export const resolveTeams = ({teamIds, teams}, _args, {dataLoader}) => {
  // TODO figure out how to lock this down without using the tms, since the mutation may have invalidated it
  return teamIds && teamIds.length > 0 ? dataLoader.get('teams').loadMany(teamIds) : teams
  // const {tms} = authToken;
  // const teamDocs = (teamIds && teamIds.length > 0) ? await dataLoader.get('teams').loadMany(teamIds) : teams;
  // return Array.isArray(teamDocs) ? teamDocs.filter((team) => tms.includes(team.id)) : null;
}

export const resolveTeamMember = ({teamMemberId, teamMember}, _args, {dataLoader}) => {
  return teamMemberId ? dataLoader.get('teamMembers').load(teamMemberId) : teamMember
}

export const resolveTeamMembers = ({teamMemberIds, teamMembers}, _args, {dataLoader}) => {
  return teamMemberIds && teamMemberIds.length > 0
    ? dataLoader.get('teamMembers').loadMany(teamMemberIds)
    : teamMembers
}

export const resolveUnlockedStages = async ({meetingId, unlockedStageIds}, _args, {dataLoader}) => {
  if (!unlockedStageIds || unlockedStageIds.length === 0 || !meetingId) return undefined
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  return unlockedStageIds.map((stageId) => findStageById(meeting.phases, stageId)!.stage)
}

export const resolveUser = ({userId, user}, _args, {dataLoader}) => {
  return userId ? dataLoader.get('users').load(userId) : user
}

/* Special resolvers */

export const resolveForSU = (fieldName) => (source, _args, {authToken}) => {
  return isSuperUser(authToken) ? source[fieldName] : undefined
}

export const makeResolve = (idName, docName, dataLoaderName, isMany?: boolean) => (
  source,
  _args,
  {dataLoader}
) => {
  const idValue = source[idName]
  const method = isMany ? 'loadMany' : 'load'
  return idValue ? dataLoader.get(dataLoaderName)[method](idValue) : source[docName]
}

export const resolveFilterByTeam = (resolver, getTeamId) => async (source, _args, context) => {
  const {teamIdFilter} = source
  const resolvedArray = await resolver(source, _args, context)
  return teamIdFilter
    ? resolvedArray.filter((obj) => getTeamId(obj) === teamIdFilter)
    : resolvedArray
}

export const resolveForBillingLeaders = (fieldName) => async (
  source,
  _args,
  {authToken, dataLoader}
) => {
  const {id: orgId} = source
  const viewerId = getUserId(authToken)
  const isBillingLeader = await isUserBillingLeader(viewerId, orgId, dataLoader)
  return isBillingLeader || isSuperUser(authToken) ? source[fieldName] : undefined
}
