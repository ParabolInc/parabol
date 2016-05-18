exports.up = (r, connection) =>
  r.tableCreate('Meeting').run(connection);

exports.down = (r, connection) =>
  r.tableDrop('Meeting').run(connection);
