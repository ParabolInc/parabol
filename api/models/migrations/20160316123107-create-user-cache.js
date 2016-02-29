exports.up = function (r, connection) {
  return r.tableCreate('CachedUser').run(connection);
};

exports.down = function (r, connection) {
  return r.tableDrop('CachedUser').run(connection);
};
