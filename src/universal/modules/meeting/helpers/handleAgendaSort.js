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
        }
        return currentResponse;
      }
    }
  }
  return undefined;
}
