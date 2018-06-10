import setIncomingAtDropLocation from 'universal/utils/multiplayerMasonry/setIncomingAtDropLocation'
import setIncomingTemporarily from 'universal/utils/multiplayerMasonry/setIncomingTemporarily'

const handleNewGroup = (childrenCache, parentCache) => {
  const {
    droppedCards,
    incomingChild: {itemId}
  } = parentCache

  if (droppedCards[itemId]) {
    setIncomingAtDropLocation(childrenCache, parentCache)
  } else {
    setIncomingTemporarily(childrenCache, parentCache)
  }
}

export default handleNewGroup
