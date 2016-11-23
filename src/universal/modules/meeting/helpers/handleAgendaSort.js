export default function handleAgendaSort(optimisticUpdates, queryResponse, currentResponse) {
  if (optimisticUpdates) {
    const {updatedAgendaItem} = optimisticUpdates;
    if (updatedAgendaItem && updatedAgendaItem.hasOwnProperty('sortOrder')) {
      const {id, sortOrder} = updatedAgendaItem;
      const {agenda} = currentResponse;
      const fromItem = agenda.find((item) => item.id === id);
      if (fromItem) {
        if (sortOrder !== undefined) {
          fromItem.sortOrder = sortOrder;
          agenda.sort((a, b) => a.sortOrder - b.sortOrder);
        }
        return currentResponse;
      }
    }
  }
  return undefined;
}
