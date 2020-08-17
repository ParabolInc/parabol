import {commitLocalUpdate} from 'react-relay'
import {IUser} from '../../types/graphql'
import Atmosphere from '../../Atmosphere'

const filterTeamMember = (atmosphere: Atmosphere, filteredUserId: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer) return
    const userFilter = filteredUserId ? store.get<IUser>(filteredUserId)! : null
    if (userFilter) {
      viewer.setLinkedRecord(userFilter, 'teamMemberFilter')
    } else {
      viewer.setValue(null, 'teamMemberFilter')
    }
  })
}

export default filterTeamMember
