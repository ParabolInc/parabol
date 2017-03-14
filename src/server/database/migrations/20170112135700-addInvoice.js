exports.up = async (r) => {
  const tables = [
    r.tableCreate('Invoice'),
    r.tableCreate('InvoiceItemHook')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
    // ignore
  }
  const indices = [
    r.table('Invoice').indexCreate('orgIdStartAt', (row) => [row('orgId'), row('startAt')]),
    r.table('InvoiceItemHook').indexCreate('prorationDate'),
    r.table('InvoiceItemHook').indexCreate('userId')
    // r.table('InvoiceItemHook').indexCreate('prorationDateSubId', (row) => [row('prorationDate'), row('subId')])
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }
};

exports.down = async (r) => {
  const tables = [
    r.tableDrop('Invoice'),
    r.tableDrop('InvoiceItemHook'),
  ];
  await Promise.all(tables);
};
