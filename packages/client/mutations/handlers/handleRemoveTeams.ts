import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveTeam = (teamId: string, store: RecordSourceSelectorProxy<any>) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  safeRemoveNodeFromArray(teamId, viewer, 'teams')
}

const handleRemoveTeams = pluralizeHandler(handleRemoveTeam)
export default handleRemoveTeams
