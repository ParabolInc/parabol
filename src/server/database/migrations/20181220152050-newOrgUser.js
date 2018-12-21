import shortid from 'shortid'

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
          id: shortid.generate(),
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
      orgs: r.table('Organization').replace(r.row.without('orgUsers')),
      userIdx: r.table('User').indexDrop('userOrgs'),
      orgIdx: r.table('Organization').indexDrop('orgUsers')
    })
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await r.tableDrop('OrganizationUser')
    await r.table('User').indexCreate('userOrgs')
    await r.table('Organization').indexCreate('orgUsers')
  } catch (e) {
    // noop
  }
}
