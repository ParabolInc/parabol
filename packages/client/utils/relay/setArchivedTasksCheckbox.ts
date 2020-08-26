import {commitLocalUpdate} from 'react-relay'
import Atmosphere from '../../Atmosphere'

const setArchivedTasksCheckbox = (
  atmosphere: Atmosphere,
  showArchivedTasksCheckbox: boolean
) => {
  commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer) return
    viewer.setValue(showArchivedTasksCheckbox, 'showArchivedTasksCheckbox')
  })
}

export default setArchivedTasksCheckbox
