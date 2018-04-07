import getRethink from 'server/database/rethinkDriver';

const updateGroupTitle = (reflectionGroupId, smartTitle, title, overwriteTitle) => {
  const r = getRethink();
  const now = new Date();
  return r.table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update({
      smartTitle,
      title: overwriteTitle ? title : undefined,
      updatedAt: now
    });
};

export default updateGroupTitle;
