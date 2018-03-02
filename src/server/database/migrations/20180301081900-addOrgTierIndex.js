exports.up = async (r) => {
  await r
    .table('Organization')
    .indexCreate('tier');
};

exports.down = async (r) => {
  await r
    .table('Orgainzation')
    .indexDrop('tier');
};
