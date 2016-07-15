exports.up = async (r) => await r.tableCreate('UserProfile');

exports.down = async (r) => await r.tableDrop('UserProfile');
