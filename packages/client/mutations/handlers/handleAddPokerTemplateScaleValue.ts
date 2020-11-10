import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddPokerTemplateScaleValue = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const scaleValueId = newNode.getDataID() as string
  const scaleId = scaleValueId.split(":")[0]
  const scale = store.get(scaleId)
  addNodeToArray(newNode, scale, 'values', 'value')
}

export default handleAddPokerTemplateScaleValue
