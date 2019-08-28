import createProxyRecord from '../utils/relay/createProxyRecord'
import {REFLECTION_WIDTH} from '../utils/multiplayerMasonry/masonryConstants'
import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment UpdateDragLocationMutation_team on UpdateDragLocationPayload {
    remoteDrag {
      id
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
  if (!payload) return
  const sourceId = payload.getValue('sourceId')
  if (!sourceId) return
  const userId = payload.getValue('userId')
  const reflection = store.get(sourceId)
  if (!reflection) return
  const dragUserId = reflection.getValue('dragUserId')
  // ignore a message sent by the loser of a conflict
  if (dragUserId !== userId) return
  const coords = payload.getLinkedRecord('coords')
  const foreignX = coords.getValue('x')
  const foreignY = coords.getValue('y')
  const clientWidth = payload.getValue('clientWidth')
  const clientHeight = payload.getValue('clientHeight')
  const targetId = payload.getValue('targetId')
  const remoteCoords = createProxyRecord(store, 'Coords2D', {x: foreignX, y: foreignY})
  const remoteClientDims = createProxyRecord(store, 'Coords2D', {width: clientWidth, height: clientHeight})
  const remoteTargetOffset = createProxyRecord(store, 'Coords2D', {x: clientWidth, height: clientHeight})
  reflection.setLinkedRecord(
  )
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
