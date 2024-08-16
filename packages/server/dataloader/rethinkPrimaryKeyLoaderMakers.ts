import RethinkPrimaryKeyLoaderMaker from './RethinkPrimaryKeyLoaderMaker'

/**
 * all rethink dataloader types which also must exist in {@link rethinkDriver/RethinkSchema}
 */
export const comments = new RethinkPrimaryKeyLoaderMaker('Comment')
export const reflectPrompts = new RethinkPrimaryKeyLoaderMaker('ReflectPrompt')
export const massInvitations = new RethinkPrimaryKeyLoaderMaker('MassInvitation')
export const meetingMembers = new RethinkPrimaryKeyLoaderMaker('MeetingMember')
export const newMeetings = new RethinkPrimaryKeyLoaderMaker('NewMeeting')
export const newFeatures = new RethinkPrimaryKeyLoaderMaker('NewFeature')
export const notifications = new RethinkPrimaryKeyLoaderMaker('Notification')
export const slackAuths = new RethinkPrimaryKeyLoaderMaker('SlackAuth')
export const slackNotifications = new RethinkPrimaryKeyLoaderMaker('SlackNotification')
export const tasks = new RethinkPrimaryKeyLoaderMaker('Task')
export const teamInvitations = new RethinkPrimaryKeyLoaderMaker('TeamInvitation')
