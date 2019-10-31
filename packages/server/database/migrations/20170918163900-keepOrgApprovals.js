exports.up = async (r) => {
  const now = new Date()
  await r
    .table('OrgApproval')
    .update({
      updatedAt: now,
      status: 'PENDING'
    })
    .run()
}

exports.down = async (r) => {
  await r
    .table('OrgApproval')
    .replace((row) => {
      return row.without('updatedAt', 'status')
    })
    .run()
}
