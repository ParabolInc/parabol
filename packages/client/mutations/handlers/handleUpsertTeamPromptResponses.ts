import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleUpsertTeamPromptResponses = (
  responses: readonly RecordProxy[],
  meetingId: string,
  store: RecordSourceSelectorProxy
) => {
  const stages = store.get(meetingId)?.getLinkedRecords('phases')?.[0]?.getLinkedRecords('stages')
  if (!stages) return
  responses.forEach((response) => {
    const userId = response.getValue('userId')
    const stage = stages.find(
      (stage) => stage.getLinkedRecord('teamMember')?.getValue('userId') === userId
    )
    if (!stage) return
    const stageResponses = stage.getLinkedRecords('responses') ?? []
    const responseId = response.getDataID()
    if (stageResponses.some((stageResponse) => stageResponse.getDataID() === responseId)) return
    stage.setLinkedRecords([...stageResponses, response], 'responses')
  })
}

export default handleUpsertTeamPromptResponses
