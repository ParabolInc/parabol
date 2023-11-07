import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveTeam = (teamId: string, store: RecordSourceSelectorProxy<any>) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  safeRemoveNodeFromArray(teamId, viewer, 'teams')
  viewer.setValue(false, 'canAccess', {entity: 'Team', id: teamId})
  const team = store.get(teamId)
  if (team) {
    team.setValue(false, 'isViewerOnTeam')
  }
}

const handleRemoveTeams = pluralizeHandler(handleRemoveTeam)
export default handleRemoveTeams
