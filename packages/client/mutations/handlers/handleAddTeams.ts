import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import pluralizeHandler from './pluralizeHandler'

const handleAddTeam = (newNode: RecordProxy, store: RecordSourceSelectorProxy) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  addNodeToArray(newNode, viewer, 'teams', 'name')
  // used for meetings
  const teamId = newNode.getValue('id')
  viewer.setLinkedRecord(newNode, 'team', {teamId})
}

const handleAddTeams = pluralizeHandler(handleAddTeam)
export default handleAddTeams
