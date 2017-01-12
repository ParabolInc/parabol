exports.up = async(r) => {
  const tables = [
    r.tableCreate('Invoice'),
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
  }
  const indices = [
    r.table('Invoice').indexCreate('orgId')
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
  }
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('Invoice'),
  ];
  await Promise.all(tables);
};
