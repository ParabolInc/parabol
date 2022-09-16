export const up = async function (r) {
  try {
    await Promise.all([
      r
        .table('OrganizationUser')
        .indexCreate('tierInactive', [r.row('tier'), r.row('inactive')])
        .run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r) {
  try {
    await Promise.all([r.table('OrganizationUser').indexDrop('tierInactive').run()])
  } catch (e) {
    console.log(e)
  }
}
