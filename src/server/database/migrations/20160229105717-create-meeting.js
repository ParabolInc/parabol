exports.up = (r) => r.tableCreate('Meeting');

exports.down = (r) => r.tableDrop('Meeting');
