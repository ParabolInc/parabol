exports.up = async (r) => {
  try {
    await r.tableCreate('OrganizationUser')
  } catch (e) {
    // noop
  }
  try {
    await r({
      userId: r.table('OrganizationUser').indexCreate('userId'),
      orgId: r.table('OrganizationUser').indexCreate('orgId')
    })
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await r.tableDrop('OrganizationUser')
  } catch (e) {
    // noop
  }
}
