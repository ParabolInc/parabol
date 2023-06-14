import {commitLocalUpdate} from 'relay-runtime'
import Atmosphere from '../../Atmosphere'

const setDefaultTeamId = (atmosphere: Atmosphere, teamId: string) => {
  return commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer) return
    viewer.setValue(teamId, 'defaultTeamId')
  })
}

export default setDefaultTeamId
