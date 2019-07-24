import {commitLocalUpdate} from 'react-relay'
import createProxyRecord from '../relay/createProxyRecord'

const setClosingTransform = (atmosphere, itemId, finalCoords) => {
  commitLocalUpdate(atmosphere, (store) => {
    const reflection = store.get(itemId)
    if (!reflection) return
    const dragContext = reflection.getLinkedRecord('dragContext')
    if (!dragContext) return
    const dragCoords = createProxyRecord(store, 'Coords2D', finalCoords)
    dragContext.setLinkedRecord(dragCoords, 'dragCoords')
  })
}

export default setClosingTransform
