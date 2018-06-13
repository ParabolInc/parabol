import {commitLocalUpdate} from 'react-relay'

const setClosingTransform = (atmosphere, itemId, left, top) => {
  commitLocalUpdate(atmosphere, (store) => {
    const reflection = store.get(itemId)
    reflection
      .getLinkedRecord('dragContext')
      .setValue(`translate(${left}px, ${top}px)`, 'closingTransform')
  })
}

export default setClosingTransform
