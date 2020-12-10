import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleAddPokerTemplateScaleValue = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const scaleValueId = newNode.getDataID() as string
  const scaleId = scaleValueId.split(":")[0]
  const scale = store.get(scaleId)
  if (!scale) return
  const values = scale.getLinkedRecords('values')
  if (!values) return
  values.splice(values.length - 2, 0, newNode) // Append at the end of the sub-array (minus ? and Pass)
  scale.setLinkedRecords(values, "values")
}

export default handleAddPokerTemplateScaleValue
