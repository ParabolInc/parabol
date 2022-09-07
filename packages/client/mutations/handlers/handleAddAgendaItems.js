import addNodeToArray from '../../utils/relay/addNodeToArray'
import pluralizeHandler from './pluralizeHandler'

const handleAddAgendaItem = (newNode, returnedMeeting, store) => {
  const teamId = newNode.getValue('teamId')
  const team = store.get(teamId)
  addNodeToArray(newNode, team, 'agendaItems', 'sortOrder')
  const meeting = store.get(returnedMeeting.getValue('id'))
  if (meeting) {
    addNodeToArray(newNode, meeting, 'agendaItems', 'sortOrder')
  }
}

const handleAddAgendaItems = pluralizeHandler(handleAddAgendaItem)
export default handleAddAgendaItems
