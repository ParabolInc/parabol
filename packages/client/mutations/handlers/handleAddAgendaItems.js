import pluralizeHandler from './pluralizeHandler'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddAgendaItem = (newNode, store) => {
  const teamId = newNode.getValue('teamId')
  const team = store.get(teamId)
  addNodeToArray(newNode, team, 'agendaItems', 'sortOrder')
}

const handleAddAgendaItems = pluralizeHandler(handleAddAgendaItem)
export default handleAddAgendaItems
