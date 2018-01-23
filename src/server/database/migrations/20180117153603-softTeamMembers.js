exports.up = async (r) => {
  try {
    await r.tableCreate('SoftTeamMember')
  } catch (e) {
    // noop
  }
  try {
    await r.table('SoftTeamMember').indexCreate('email');
  } catch (e) {
    // noop
  }
  try {
    await r({
      project: r.table('Project')
        .replace((row) => {
          return row
            .merge({
              assigneeId: row('teamMemberId'),
              isSoftProject: false
            })
            .without('teamMemberId')
        }),
      history: r.table('ProjectHistory')
        .replace((row) => {
          return row.merge({
            assigneeId: row('teamMemberId'),
            isSoftProject: false
          })
        })
    })
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('SoftTeamMember');
  } catch (e) {
    // noop
  }
};
