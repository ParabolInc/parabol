import {getUserId} from 'server/utils/authorization';
import nullIfEmpty from 'universal/utils/nullIfEmpty';

export const resolveAgendaItem = ({agendaItemId, agendaItem}, args, {dataLoader}) => {
  return agendaItemId ? dataLoader.get('agendaItems').load(agendaItemId) : agendaItem;
};

export const resolveInvitation = ({invitationId, invitation}, args, {dataLoader}) => {
  return invitationId ? dataLoader.get('invitations').load(invitationId) : invitation;
};

export const resolveInvitations = ({invitationIds, invitations}, args, {dataLoader}) => {
  return (invitationIds && invitationIds.length > 0) ?
    dataLoader.get('invitations').loadMany(invitationIds) : invitations;
};

export const resolveMeeting = ({meeting, meetingId}, args, {dataLoader}) => {
  return meetingId ? dataLoader.get('meetings').load(meetingId) : meeting;
};

export const resolveNotification = ({notificationId, notification}, args, {dataLoader}) => {
  return notificationId ? dataLoader.get('notifications').load(notificationId) : notification;
};

export const resolveNotificationForViewer = async ({notificationIds, notifications}, args, {authToken, dataLoader}) => {
  const notificationDocs = (notificationIds && notificationIds.length > 0) ?
    await dataLoader.get('notifications').loadMany(notificationIds) : notifications;
  const viewerId = getUserId(authToken);
  return notificationDocs ? notificationDocs.find((n) => n.userIds.includes(viewerId)) : null;
};

export const makeResolveNotificationForViewer = (idArray, docArray) => async (source, args, {authToken, dataLoader}) => {
  const notificationIds = source[idArray];
  const notifications = source[docArray];
  const notificationDocs = (notificationIds && notificationIds.length > 0) ?
    await dataLoader.get('notifications').loadMany(notificationIds) : notifications;
  const viewerId = getUserId(authToken);
  return notificationDocs ? notificationDocs.find((n) => n.userIds.includes(viewerId)) : null;
};

export const makeResolveNotificationsForViewer = (idArray, docArray) => async (source, args, {authToken, dataLoader}) => {
  const notificationIds = source[idArray];
  const notifications = source[docArray];
  const notificationDocs = (notificationIds && notificationIds.length > 0) ?
    await dataLoader.get('notifications').loadMany(notificationIds) : notifications;
  const viewerId = getUserId(authToken);
  if (!notificationDocs) return null;
  const viewerNotifications = notificationDocs.filter((n) => n.userIds.includes(viewerId));
  return nullIfEmpty(viewerNotifications);
};

export const resolveNotifications = ({notificationIds, notifications}, args, {dataLoader}) => {
  return (notificationIds && notificationIds.length > 0) ?
    dataLoader.get('notifications').loadMany(notificationIds) : notifications;
};

export const resolveOrganization = ({orgId, organization}, args, {dataLoader}) => {
  return orgId ? dataLoader.get('organizations').load(orgId) : organization;
};

export const resolveOrgApproval = ({orgApprovalId, orgApproval}, args, {dataLoader}) => {
  return orgApprovalId ? dataLoader.get('orgApprovals').load(orgApprovalId) : orgApproval;
};

export const resolveProject = async ({project, projectId}, args, {authToken, dataLoader}) => {
  const projectDoc = projectId ? await dataLoader.get('projects').load(projectId) : project;
  const {userId, tags} = projectDoc;
  const isViewer = userId === getUserId(authToken);
  return (isViewer || !tags.includes('private')) ? projectDoc : null;
};

export const resolveProjects = async ({projectIds}, args, {authToken, dataLoader}) => {
  if (!projectIds || projectIds.length === 0) return null;
  const projects = await dataLoader.get('projects').loadMany(projectIds);
  const {userId} = projects[0];
  const isViewer = userId === getUserId(authToken);
  const teamProjects = projects.filter(({teamId}) => authToken.tms.includes(teamId));
  return isViewer ? teamProjects : nullIfEmpty(teamProjects.filter((p) => !p.tags.includes('private')));
};

export const resolveSoftTeamMember = async ({softTeamMemberId, softTeamMember}, args, {authToken, dataLoader}) => {
  const teamMember = softTeamMemberId ? await dataLoader.get('softTeamMembers').load(softTeamMemberId) : softTeamMember;
  return authToken.tms.includes(teamMember.teamId) ? teamMember : undefined;
};

export const resolveSoftTeamMembers = async ({softTeamMemberIds, softTeamMembers}, args, {authToken, dataLoader}) => {
  const {tms} = authToken;
  const teamMembers = softTeamMemberIds ? await dataLoader.get('softTeamMembers').loadMany(softTeamMemberIds) : softTeamMembers;
  if (!teamMembers || teamMembers.length === 0) return null;
  return teamMembers.filter((teamMember) => tms.includes(teamMember.teamId));
};

export const resolveTeam = ({team, teamId}, args, {dataLoader}) => {
  return teamId ? dataLoader.get('teams').load(teamId) : team;
};

export const resolveTeams = ({teamIds, teams}, args, {dataLoader}) => {
  return (teamIds && teamIds.length > 0) ? dataLoader.get('teams').loadMany(teamIds) : teams;
};

export const resolveTeamMember = ({teamMemberId, teamMember}, args, {dataLoader}) => {
  return teamMemberId ? dataLoader.get('teamMembers').load(teamMemberId) : teamMember;
};

export const resolveTeamMembers = ({teamMemberIds, teamMembers}, args, {dataLoader}) => {
  return (teamMemberIds && teamMemberIds.length > 0) ?
    dataLoader.get('teamMembers').loadMany(teamMemberIds) : teamMembers;
};

export const resolveUser = ({userId, user}, args, {dataLoader}) => {
  return userId ? dataLoader.get('users').load(userId) : user;
};


/* Special resolvesr */

export const makeResolve = (idName, docName, dataLoaderName) => (source, args, {dataLoader}) => {
  const idValue = source[idName];
  return idValue ? dataLoader.get(dataLoaderName).load(idValue) : source[docName];
};
export const resolveIfViewer = (ifViewerField, defaultValue) => (source, args, {authToken}) => {
  return source.userId === getUserId(authToken) ? source[ifViewerField] : defaultValue;
};

export const resolveTypeForViewer = (selfPayload, otherPayload) => ({userId}, {authToken}) => {
  return userId === getUserId(authToken) ? selfPayload : otherPayload;
};

export const resolveFilterByTeam = (resolver, getTeamId) => async (source, args, context) => {
  const {teamIdFilter} = source;
  const resolvedArray = await resolver(source, args, context);
  return teamIdFilter ? resolvedArray.filter((obj) => getTeamId(obj) === teamIdFilter) : resolvedArray;
};

export const resolveArchivedSoftProjects = async ({archivedSoftProjectIds}, args, {authToken, dataLoader}) => {
  const {tms} = authToken;
  const softProjects = await dataLoader.get('projects').loadMany(archivedSoftProjectIds);
  return softProjects.filter(({teamId}) => tms.includes(teamId));
};
