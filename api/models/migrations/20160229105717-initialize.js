exports.up = (r, connection) => { // eslint-disable-line id-length
  r.tableCreate('Meeting').run(connection);
  return r.tableCreate('Session').run(connection);
};

exports.down = (r, connection) => { // eslint-disable-line id-length
  r.tableDrop('Session').run(connection);
  return r.tableDrop('Meeting').run(connection);
};
