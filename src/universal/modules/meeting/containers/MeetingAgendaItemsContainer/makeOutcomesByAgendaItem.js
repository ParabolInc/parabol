import {ACTION, PROJECT} from 'universal/utils/constants';

function binOutcomes(outcomes, type, binField, result) {
  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    const binKey = outcome[binField];
    if (typeof result[binKey] === 'undefined') {
      result[binKey] = [];
    }
    result[binKey].push({
      ...outcome,
      type
    });
  }
}

export default function makeOutcomesByAgendaItem(actions, projects, agendaItems, sortOrder = null) {
  const outcomesByAgendaItem = { };
  // bin 'em
  binOutcomes(actions, ACTION, 'agendaId', outcomesByAgendaItem);
  binOutcomes(projects, PROJECT, 'agendaId', outcomesByAgendaItem);
  // sort 'em
  if (sortOrder !== null) {
    Object.keys(outcomesByAgendaItem).forEach((key) => {
      outcomesByAgendaItem[key].sort((a, b) => a[sortOrder] > b[sortOrder]);
    });
  }
  return outcomesByAgendaItem;
}
