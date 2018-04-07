import getRethink from 'server/database/rethinkDriver';

const updateGroupTitle = (reflectionGroupId, smartTitle, title) => {
  const r = getRethink();
  const now = new Date();
  return r.table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((g) => ({
      smartTitle,
      title: r.branch(g('titleIsUserDefined').eq(true).default(false), g('title'), title),
      updatedAt: now
    }));
};

export default updateGroupTitle;
