exports.up = async r => {
  return await r.table('TeamMember').indexCreate('cachedUserId');
};

exports.down = async r => {
  return await r.table('TeamMember').indexDrop('cachedUserId');
};
