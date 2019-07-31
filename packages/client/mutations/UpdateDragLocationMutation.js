import getInProxy from '../utils/relay/getInProxy'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {REFLECTION_WIDTH} from '../utils/multiplayerMasonry/masonryConstants'
import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment UpdateDragLocationMutation_team on UpdateDragLocationPayload {
    coords {
      x
      y
    }
    clientHeight
    clientWidth
    sourceId
    targetId
    targetOffset {
      x
      y
    }
    userId
  }
`
const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

export const updateDragLocationTeamUpdater = (payload, {atmosphere, store}) => {
  // getMasonry is false if they are not in the meeting
  if (!atmosphere.getMasonry) return
  const sourceId = getInProxy(payload, 'sourceId')
  if (!sourceId) return
  const {
    childrenCache,
    parentCache: {
      boundingBox: {left: parentLeft, top: parentTop}
    }
  } = atmosphere.getMasonry()
  const draggable = store.get(sourceId)
  if (!draggable) return
  const dragContext = draggable.getLinkedRecord('dragContext')
  // ignore a message sent before/after the start/end mutations
  if (!dragContext) return
  const dragUserId = dragContext.getValue('dragUserId')
  // ignore a message sent by the loser of a conflict
  if (dragUserId !== payload.getValue('userId')) return
  const coords = payload.getLinkedRecord('coords')
  const foreignX = coords.getValue('x')
  const foreignY = coords.getValue('y')
  const clientWidth = payload.getValue('clientWidth')
  const clientHeight = payload.getValue('clientHeight')
  const targetId = payload.getValue('targetId')
  const targetChild = childrenCache[targetId]
  let localX
  let localY
  if (targetChild && targetChild.boundingBox) {
    const targetOffset = payload.getLinkedRecord('targetOffset')
    const offsetX = targetOffset.getValue('x')
    const offsetY = targetOffset.getValue('y')
    const {top, left, height} = targetChild.boundingBox
    // if my group modal is open, show the hover over the modal, not the invisible collapsed group
    if (targetChild.modalBoundingBox && -offsetY < height && -offsetX < REFLECTION_WIDTH) {
      const {
        top: modalTop,
        left: modalLeft,
        height: modalHeight,
        width: modalWidth
      } = targetChild.modalBoundingBox
      localX = (-offsetX / REFLECTION_WIDTH) * modalWidth + modalLeft
      localY = (-offsetY / height) * modalHeight + modalTop
    } else {
      localX = left - offsetX + parentLeft
      localY = top - offsetY + parentTop
    }
  } else {
    localX = (foreignX / clientWidth) * window.innerWidth
    localY = (foreignY / clientHeight) * window.innerHeight
  }
  const newCoords = createProxyRecord(store, 'Coords2D', {x: localX, y: localY})
  dragContext.setLinkedRecord(newCoords, 'dragCoords')
}

const UpdateDragLocationMutation = (atmosphere, variables) => {
  const {_network: network} = atmosphere
  network.execute(getRequest(mutation).params, variables, {force: true})
}

export default UpdateDragLocationMutation
