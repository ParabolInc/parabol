exports.up = async (r) => await r.tableCreate('CachedUser');

exports.down = async (r) => await r.tableDrop('CachedUser');
