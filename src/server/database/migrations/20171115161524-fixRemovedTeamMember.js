exports.up = async (r) => {
  await r.table('Project')
    .update((project) => ({
      userId: project('teamMemberId').split('::')(0)
    }));
};

exports.down = () => {
  // noop
};
