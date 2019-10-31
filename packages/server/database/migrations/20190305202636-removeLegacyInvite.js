exports.up = async (r) => {
  try {
    await Promise.all([r.tableDrop('OrgApproval').run(), r.tableDrop('Invitation').run()])
  } catch (e) {}

  const OLD_TYPES = [
    'ADD_TO_TEAM',
    'DENY_NEW_USER',
    'INVITEE_APPROVED',
    'JOIN_TEAM',
    'REJOIN_TEAM',
    'REQUEST_NEW_USER',
    'TEAM_INVITE'
  ]
  try {
    await r
      .table('Notification')
      .filter((notification) => r(OLD_TYPES).contains(notification('type')))
      .delete()
      .run()
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableCreate('OrgApproval').run(), r.tableCreate('Invitation').run()])
  } catch (e) {}
}
