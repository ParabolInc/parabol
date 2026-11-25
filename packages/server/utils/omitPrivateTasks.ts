import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'

const omitPrivateTasks = <T extends {tags: readonly string[]}>(tasks: T[]) =>
  tasks.filter(({tags}) => !isTaskPrivate(tags))

export default omitPrivateTasks
