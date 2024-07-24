import RethinkPrimaryKeyLoaderMaker from './RethinkPrimaryKeyLoaderMaker'

/**
 * all rethink dataloader types which also must exist in {@link rethinkDriver/RethinkSchema}
 */
export const agendaItems = new RethinkPrimaryKeyLoaderMaker('AgendaItem')
export const atlassianAuths = new RethinkPrimaryKeyLoaderMaker('AtlassianAuth')
export const comments = new RethinkPrimaryKeyLoaderMaker('Comment')
export const reflectPrompts = new RethinkPrimaryKeyLoaderMaker('ReflectPrompt')
export const massInvitations = new RethinkPrimaryKeyLoaderMaker('MassInvitation')
export const meetingSettings = new RethinkPrimaryKeyLoaderMaker('MeetingSettings')
export const meetingMembers = new RethinkPrimaryKeyLoaderMaker('MeetingMember')
export const newMeetings = new RethinkPrimaryKeyLoaderMaker('NewMeeting')
export const newFeatures = new RethinkPrimaryKeyLoaderMaker('NewFeature')
export const notifications = new RethinkPrimaryKeyLoaderMaker('Notification')
export const templateScales = new RethinkPrimaryKeyLoaderMaker('TemplateScale')
export const slackAuths = new RethinkPrimaryKeyLoaderMaker('SlackAuth')
export const slackNotifications = new RethinkPrimaryKeyLoaderMaker('SlackNotification')
export const suggestedActions = new RethinkPrimaryKeyLoaderMaker('SuggestedAction')
export const tasks = new RethinkPrimaryKeyLoaderMaker('Task')
export const teamInvitations = new RethinkPrimaryKeyLoaderMaker('TeamInvitation')
export const templateDimensions = new RethinkPrimaryKeyLoaderMaker('TemplateDimension')
