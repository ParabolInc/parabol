import {commitLocalUpdate} from 'react-relay'
import {IUser} from '../../types/graphql'
import Atmosphere from '../../Atmosphere'

const setArchivedTasksCheckbox = (
  atmosphere: Atmosphere,
  viewerId: string,
  showArchivedTasksCheckbox: boolean
) => {
  commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.get<IUser>(viewerId)
    if (!viewer) return
    viewer.setValue(showArchivedTasksCheckbox, 'showArchivedTasksCheckbox')
  })
}

export default setArchivedTasksCheckbox
