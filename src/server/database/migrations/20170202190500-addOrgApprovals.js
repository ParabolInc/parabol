exports.up = async(r) => {
  const tables = [
    r.tableCreate('OrgApproval'),
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
  }
  const indices = [
    r.table('OrgApproval').indexCreate('teamId'),
    r.table('OrgApproval').indexCreate('orgId'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
  }
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('OrgApproval'),
  ];
  await Promise.all(tables);
};
