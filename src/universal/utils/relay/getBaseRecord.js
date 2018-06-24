// ponyfill for https://github.com/facebook/relay/issues/2480
const getBaseRecord = (store, id) => {
  return store.__recordSource.__mutator._base.get(id)
}

export default getBaseRecord
