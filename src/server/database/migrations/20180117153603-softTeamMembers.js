exports.up = async (r) => {
  try {
    await r.tableCreate('SoftTeamMember');
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('SoftTeamMember').indexCreate('email'),
      r.table('SoftTeamMember').indexCreate('teamId'),
      r.table('TeamMember').indexDrop('teamMemberId'),
      r.table('TeamMember').indexCreate('assigneeId'),
      r.table('Project').indexDrop('teamMemberId'),
      r.table('Project').indexCreate('assigneeId')
    ]);
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
            .without('teamMemberId');
        }),
      history: r.table('ProjectHistory')
        .replace((row) => {
          return row.merge({
            assigneeId: row('teamMemberId'),
            isSoftProject: false
          });
        })
    });
  } catch (e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await r.tableDrop('SoftTeamMember');
  } catch (e) {
    // noop
  }
  try {
    await r.table('TeamMember').indexDrop('assigneeId');
    await r.table('TeamMember').indexCreate('teamMemberId');
    await r.table('Project').indexDrop('assigneeId');
    await r.table('Project').indexCreate('teamMemberId');
  } catch (e) {
    // noop
  }

  try {
    await r.table('Project').filter({isSoftProject: true}).delete();
    await r.table('Project').update((row) => ({
      teamMemberId: row('assigneeId')
    }));
    await r.table('ProjectHistory').filter({isSoftProject: true}).delete();
    await r.table('ProjectHistory').update((row) => ({
      teamMemberId: row('assigneeId')
    }));
  } catch (e) {
    // noop
  }
};
