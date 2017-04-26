exports.up = async (r) => {
  await r.table('Team').replace(r.row.without('checkInGreeting'));
};

exports.down = async (r) => {
  await r.table('Team').replace(r.row.without('checkInGreeting'));
};
