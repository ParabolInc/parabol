exports.up = async (r) => {
  const indices = [
    r.table('Project').indexCreate('integrationId', (project) => project('integration')('integrationId')),
    r.table('GitHubIntegration').indexCreate('nameWithOwner')
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    console.log('Exception during Promise.all(indices)');
  }
};

exports.down = async (r) => {
  const indices = [
    r.table('Project').indexDrop('integrationId'),
    r.table('GitHubIntegration').indexDrop('nameWithOwner')
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    console.log('Exception during Promise.all(tables)');
  }
};
