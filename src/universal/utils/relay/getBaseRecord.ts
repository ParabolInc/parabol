// ponyfill for https://github.com/facebook/relay/issues/2480
import {RecordSourceSelectorProxy} from 'relay-runtime'

const getBaseRecord = (store: RecordSourceSelectorProxy, id: string) => {
  return (store as any).__recordSource.__mutator._base.get(id)
}

export default getBaseRecord
