import {RecordSourceSelectorProxy} from 'relay-runtime'

const handleUpdateStageSort = (store: RecordSourceSelectorProxy, meetingId: string, phaseType: string) => {
  const meeting = store.get(meetingId)
  if (!meeting) return
  const phases = meeting.getLinkedRecords('phases')!
  const phase = phases.find((phase) => phase.getValue('phaseType') === phaseType)!
  const stages = phase.getLinkedRecords('stages')!
  stages.sort((a, b) => {
    if (a.getValue('sortOrder')! > b.getValue('sortOrder')!) {
      return 1
    } else if (a.getValue('sortOrder')! === b.getValue('sortOrder')!) {
      if (a.getValue('dimensionRefIdx')) {
        return a.getValue('dimensionRefIdx')! > b.getValue('dimensionRefIdx')! ? 1 : -1
      } else {
        return -1
      }
    } else {
      return -1
    }
  })
  phase.setLinkedRecords(stages, 'stages')
}

export default handleUpdateStageSort
