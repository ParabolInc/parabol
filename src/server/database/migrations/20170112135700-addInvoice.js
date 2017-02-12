exports.up = async(r) => {
  const tables = [
    r.tableCreate('Invoice'),
    r.tableCreate('InvoiceItemHook')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
  }
  const indices = [
    r.table('Invoice').indexCreate('prorationDate'),
    // r.table('Invoice').indexCreate('orgId'),
    // r.table('InvoiceItemHook').indexCreate('prorationDateSubId', (row) => [row('prorationDate'), row('subId')])
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
  }
};

exports.down = async(r) => {
  const tables = [
    r.tableDrop('Invoice'),
    r.tableDrop('InvoiceItemHook'),
  ];
  await Promise.all(tables);
};
