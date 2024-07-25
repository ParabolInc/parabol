import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleAddPokerTemplateScale = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const existingScales = team.getLinkedRecords('scales') || []
  team.setLinkedRecords([newNode, ...existingScales], 'scales')
}

export default handleAddPokerTemplateScale
