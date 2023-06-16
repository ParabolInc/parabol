import {commitLocalUpdate} from 'relay-runtime'
import Atmosphere from '../../Atmosphere'

const setPreferredTeamId = (atmosphere: Atmosphere, teamId: string) => {
  return commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer) return
    viewer.setValue(teamId, 'preferredTeamId')
  })
}

export default setPreferredTeamId
