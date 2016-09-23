/* eslint-disable max-len */
exports.up = async(r) => {
  const queries = [
    r.table('Project').update((doc) => ({
      isArchived: false,
      teamId: doc('id').split('::')(0)
    })),
    r.table('Project').indexCreate('teamId'),
    r.table('Project').indexCreate('teamIdCreatedAt',
      [r.row('teamId'), r.row('createdAt')])
  ];
  await Promise.all(queries);
};

exports.down = async(r) => {
  const queries = [
    r.table('Project').indexDrop('teamId'),
    r.table('Project').indexDrop('teamIdCreatedAt'),
    r.table('Project').replace(r.row.without('teamId', 'isArchived'))
  ];
  return await Promise.all(queries);
};
