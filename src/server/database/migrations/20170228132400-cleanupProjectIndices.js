exports.up = async(r) => {
  const indices = [
    r.table('Project').indexDrop('teamIdCreatedAt'),
    r.table('Project').indexDrop('tokenExpiration'),
    r.table('Project').indexCreate('userId'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }
};

exports.down = async(r) => {
  const indices = [
    r.table('Project').indexCreate('teamIdCreatedAt'),
    r.table('Project').indexCreate('tokenExpiration'),
    r.table('Project').indexDrop('userId'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }
};
