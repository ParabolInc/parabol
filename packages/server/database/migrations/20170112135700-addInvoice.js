exports.up = async (r) => {
  const tables = [r.tableCreate('Invoice').run(), r.tableCreate('InvoiceItemHook').run()]
  try {
    await Promise.all(tables)
  } catch (e) {
    // ignore
  }
  const indices = [
    r
      .table('Invoice')
      .indexCreate('orgIdStartAt', (row) => [row('orgId'), row('startAt')])
      .run(),
    r
      .table('InvoiceItemHook')
      .indexCreate('prorationDate')
      .run(),
    r
      .table('InvoiceItemHook')
      .indexCreate('userId')
      .run()
    // r.table('InvoiceItemHook').indexCreate('prorationDateSubId', (row) => [row('prorationDate'), row('subId')])
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }
}

exports.down = async (r) => {
  const tables = [r.tableDrop('Invoice').run(), r.tableDrop('InvoiceItemHook').run()]
  await Promise.all(tables)
}
