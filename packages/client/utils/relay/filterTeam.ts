import {commitLocalUpdate} from 'react-relay'
import ITeam from '../../../server/database/types/Team'
import Atmosphere from '../../Atmosphere'

const filterTeam = (atmosphere: Atmosphere, teamId: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')!
    const teamFilter = teamId ? store.get<ITeam>(teamId)! : null
    if (teamFilter) {
      viewer.setLinkedRecord(teamFilter, 'teamFilter')
    } else {
      viewer.setValue(null, 'teamFilter')
    }
  })
}

export default filterTeam
