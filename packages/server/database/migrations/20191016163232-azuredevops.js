exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('AzureDevopsAuth')])
  } catch (e) {
    /**/
  }
  try {
    await Promise.all([
      r.table('AzureDevopsAuth').indexCreate('userId'),
      r.table('AzureDevopsAuth').indexCreate('teamId'),
      r.table('AzureDevopsAuth').indexCreate('accountId')
    ])
  } catch (e) {
    /**/
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('AzureDevopsAuth')])
  } catch (e) {
    /**/
  }
}
