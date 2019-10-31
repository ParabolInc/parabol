exports.up = async (r) => {
  try {
    await r.tableCreate('SoftTeamMember').run()
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r
        .table('SoftTeamMember')
        .indexCreate('email')
        .run(),
      r
        .table('SoftTeamMember')
        .indexCreate('teamId')
        .run(),
      r
        .table('TeamMember')
        .indexDrop('teamMemberId')
        .run(),
      r
        .table('TeamMember')
        .indexCreate('assigneeId')
        .run(),
      r
        .table('Project')
        .indexDrop('teamMemberId')
        .run(),
      r
        .table('Project')
        .indexCreate('assigneeId')
        .run()
    ])
  } catch (e) {
    // noop
  }
  try {
    await r({
      project: r.table('Project').replace((row) => {
        return row
          .merge({
            assigneeId: row('teamMemberId'),
            isSoftProject: false
          })
          .without('teamMemberId')
      }),
      history: r.table('ProjectHistory').replace((row) => {
        return row.merge({
          assigneeId: row('teamMemberId'),
          isSoftProject: false
        })
      })
    }).run()
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('SoftTeamMember').run()
  } catch (e) {
    // noop
  }
  try {
    await r
      .table('TeamMember')
      .indexDrop('assigneeId')
      .run()
    await r
      .table('TeamMember')
      .indexCreate('teamMemberId')
      .run()
    await r
      .table('Project')
      .indexDrop('assigneeId')
      .run()
    await r
      .table('Project')
      .indexCreate('teamMemberId')
      .run()
  } catch (e) {
    // noop
  }

  try {
    await r
      .table('Project')
      .filter({isSoftProject: true})
      .delete()
      .run()
    await r
      .table('Project')
      .update((row) => ({
        teamMemberId: row('assigneeId')
      }))
      .run()
    await r
      .table('ProjectHistory')
      .filter({isSoftProject: true})
      .delete()
      .run()
    await r
      .table('ProjectHistory')
      .update((row) => ({
        teamMemberId: row('assigneeId')
      }))
      .run()
  } catch (e) {
    // noop
  }
}
