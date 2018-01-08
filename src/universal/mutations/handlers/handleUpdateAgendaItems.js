const handleUpdateAgendaItems = (store, teamId) => {
  const team = store.get(teamId);
  if (!team) return;
  const agendaItems = team.getLinkedRecords('agendaItems');
  if (!agendaItems) return;
  agendaItems.sort((a, b) => {
    return a.getValue('sortOrder') > b.getValue('sortOrder') ? 1 : -1;
  });
  team.setLinkedRecords(agendaItems, 'agendaItems');
};

export default handleUpdateAgendaItems;
