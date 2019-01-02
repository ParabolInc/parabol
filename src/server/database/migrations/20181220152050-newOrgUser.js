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
    const orgs = await r.table('Organization').pluck('id', 'createdAt', 'orgUsers')
    const organizationUsers = []
    orgs.forEach((org) => {
      org.orgUsers.forEach((orgUser) => {
        organizationUsers.push({
          id: shortid.generate(),
          inactive: orgUser.inactive || false,
          joinedAt: org.createdAt,
          newUserUntil: org.createdAt,
          orgId: org.id,
          removedAt: null,
          role: orgUser.role || null,
          userId: orgUser.id
        })
      })
    })
    await r({
      organizationUsers: r.table('OrganizationUser').insert(organizationUsers),
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
