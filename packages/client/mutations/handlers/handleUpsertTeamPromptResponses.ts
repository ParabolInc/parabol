import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const addResponse = (parent: RecordProxy, response: RecordProxy) => {
  const responses = parent.getLinkedRecords('responses')
  if (!responses) return
  const responseId = response.getDataID()
  if (responses.some((existing) => existing.getDataID() === responseId)) return
  parent.setLinkedRecords([...responses, response], 'responses')
}

const handleUpsertTeamPromptResponses = (
  responses: readonly RecordProxy[],
  meetingId: string,
  store: RecordSourceSelectorProxy
) => {
  const meeting = store.get(meetingId)
  if (!meeting) return
  const stages = meeting.getLinkedRecords('phases')?.[0]?.getLinkedRecords('stages') ?? []
  responses.forEach((response) => {
    const userId = response.getValue('userId')
    const stage = stages.find(
      (stage) => stage.getLinkedRecord('teamMember')?.getValue('userId') === userId
    )
    addResponse(meeting, response)
    if (stage) addResponse(stage, response)
  })
}

export default handleUpsertTeamPromptResponses
