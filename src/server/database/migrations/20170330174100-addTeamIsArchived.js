exports.up = async (r) => {
  r.table('Team').update({isArchived: false});
};

exports.down = async (r) => {
  r.table('Action').replace(r.row.without('isArchived'));
};
