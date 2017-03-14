exports.up = async (r) => {
  const fields = [
    r.table('Project').replace((row) => {
      return row
        .merge({
          sortOrder: row('teamSort').default(r.random())
        })
        .without('teamSort', 'userSort');
    }, {nonAtomic: true})
  ];
  await Promise.all(fields);

  const indices = [
    r.table('Project').indexDrop('tokenExpiration'),
    r.table('Project').indexCreate('userId'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }
};

exports.down = async (r) => {
  const fields = [
    r.table('Project').replace((row) => {
      return row
        .merge({
          teamSort: row('sortOrder'),
          userSort: row('sortOrder'),
        })
        .without('sortOrder');
    })
  ];
  await Promise.all(fields);

  const indices = [
    r.table('Project').indexCreate('tokenExpiration'),
    r.table('Project').indexDrop('userId'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }
};
