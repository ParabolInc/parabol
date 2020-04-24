import pluralizeHandler from './pluralizeHandler'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddTeam = (newNode, store) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  addNodeToArray(newNode, viewer, 'teams', 'name')
  // used for meetings
  const teamId = newNode.getValue('id')
  viewer.setLinkedRecord(newNode, 'team', {teamId})
}

const handleAddTeams = pluralizeHandler(handleAddTeam)
export default handleAddTeams
