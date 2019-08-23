exports.up = async (r) => {
  try {
    await r
      .table('OrganizationUser')
      .filter({role: 'billingLeader'})
      .update({role: 'BILLING_LEADER'})
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('OrganizationUser')
      .filter({role: 'BILLING_LEADER'})
      .update({role: 'billingLeader'})
  } catch (e) {
    console.log(e)
  }
}
