import RethinkPrimaryKeyLoaderMaker from './RethinkPrimaryKeyLoaderMaker'

/**
 * all rethink dataloader types which also must exist in {@link rethinkDriver/RethinkSchema}
 */
export const notifications = new RethinkPrimaryKeyLoaderMaker('Notification')
export const tasks = new RethinkPrimaryKeyLoaderMaker('Task')
