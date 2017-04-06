/* eslint-disable max-len */
exports.up = async (r) => {
  const queries = [
    r.table('Project').update((doc) => ({
      isArchived: false,
      teamId: doc('id').split('::').nth(0)
    })),
    r.table('Project').indexCreate('teamId')
  ];
  await Promise.all(queries);
};

exports.down = async (r) => {
  const queries = [
    r.table('Project').indexDrop('teamId'),
    r.table('Project').replace(r.row.without('teamId', 'isArchived'))
  ];
  await Promise.all(queries);
};
