exports.up = async (r) => {
  const tables = [
    r.tableCreate('Provider'),
    r.tableCreate('SlackIntegration')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
    console.log('Exception during Promise.all(tables)');
  }
  const indices = [
    r.table('Provider').indexCreate('teamIds', {multi: true}),
    r.table('Provider').indexCreate('providerUserId'),
    r.table('SlackIntegration').indexCreate('teamId'),
    r.table('SlackIntegration').indexCreate('userIds', {multi: true})
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    console.log('Exception during Promise.all(indices)');
  }
};

exports.down = async (r) => {
  const tables = [
    r.tableDrop('SlackIntegration'),
    r.tableDrop('Provider')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
    console.log('Exception during Promise.all(tables)');
  }
};
