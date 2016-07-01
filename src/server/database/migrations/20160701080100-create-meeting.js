exports.up = async r => {
  await r.tableCreate('Meeting');
};

exports.down = async r => {
  return await r.tableDrop('Meeting');
};
