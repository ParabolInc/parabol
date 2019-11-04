const AGENDA_ID_FIELD = 'agendaId'

/* eslint-disable max-len */
exports.up = async (r) => {
  const withAgendaId = {
    [AGENDA_ID_FIELD]: null
  }
  const queries = [
    r
      .table('Action')
      .update(withAgendaId)
      .run(),
    r
      .table('Action')
      .indexCreate('teamMemberId')
      .run(),
    r
      .table('Action')
      .indexCreate('agendaId')
      .run(),
    r
      .table('Project')
      .update(withAgendaId)
      .run()
  ]
  await Promise.all(queries)
}

exports.down = async (r) => {
  const withoutAgendaId = r.row.without(AGENDA_ID_FIELD)
  const queries = [
    r
      .table('Action')
      .replace(withoutAgendaId)
      .run(),
    r
      .table('Action')
      .indexDrop('teamMemberId')
      .run(),
    r
      .table('Action')
      .indexDrop('agendaId')
      .run(),
    r
      .table('Project')
      .replace(withoutAgendaId)
      .run()
  ]
  await Promise.all(queries)
}
