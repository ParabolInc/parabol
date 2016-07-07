exports.up = async r => {
  try {
    return await r.table('TeamMember').indexCreate('cachedUserId');
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

exports.down = async r => {
  try {
    return await r.table('TeamMember').indexDrop('cachedUserId');
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
