import {useMemo} from 'react'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'
import {ParabolScopingSearchResults_meeting} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'

const useRecordIdsWithStages = (
  phases:
    | ParabolScopingSearchResults_meeting['phases']
    | JiraScopingSearchResults_meeting['phases'],
  phaseType: NewMeetingPhaseTypeEnum,
  recordName: 'issue' | 'task'
): Set<string> => {
  const targetPhase = (phases as ReadonlyArray<any>).find((phase) => phase.phaseType === phaseType)!
  const {stages} = targetPhase
  return useMemo(() => {
    const usedRecordIds = new Set<string>()
    stages!.forEach((stage) => {
      if (!stage[recordName]) return
      usedRecordIds.add(stage[recordName].id)
    })
    return usedRecordIds
  }, [stages])
}

export default useRecordIdsWithStages
