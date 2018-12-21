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
  try {
    await r.table('Organization').forEach((organization) => {
      return organization('orgUsers').forEach((orgUser) => {
        return r.table('OrganizationUser').insert({
          id: organization('id')
            .add('::')
            .add(orgUser('id')),
          inactive: orgUser('inactive').default(false),
          joinedAt: organization('createdAt'),
          newUserUntil: organization('createdAt'),
          orgId: organization('id'),
          removedAt: null,
          role: orgUser('role').default(null),
          userId: orgUser('id')
        })
      })
    })
    await r({
      users: r.table('User').replace(r.row.without('userOrgs')),
      orgs: r.table('Organization').replace(r.row.without('orgUsers'))
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
