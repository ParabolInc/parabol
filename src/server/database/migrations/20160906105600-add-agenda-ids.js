const AGENDA_ID_FIELD = 'agendaId';

/* eslint-disable max-len */
exports.up = async (r) => {
  const withAgendaId = {
    [AGENDA_ID_FIELD]: null
  };
  const queries = [
    r.table('Action').update(withAgendaId),
    r.table('Action').indexCreate('teamMemberId'),
    r.table('Action').indexCreate('agendaId'),
    r.table('Project').update(withAgendaId),
  ];
  await Promise.all(queries);
};

exports.down = async (r) => {
  const withoutAgendaId = r.row.without(AGENDA_ID_FIELD);
  const queries = [
    r.table('Action').replace(withoutAgendaId),
    r.table('Action').indexDrop('teamMemberId'),
    r.table('Action').indexDrop('agendaId'),
    r.table('Project').replace(withoutAgendaId),
  ];
  await Promise.all(queries);
};
