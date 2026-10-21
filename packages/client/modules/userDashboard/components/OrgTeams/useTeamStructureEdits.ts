import {useRef, useState} from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useSetTeamStructureMutation from '../../../../mutations/useSetTeamStructureMutation'
import {
  type TeamStructureEdit,
  type TeamStructureLevelData,
  toTeamStructureInput
} from './teamStructureEdits'

// Saves edits one at a time, each on top of the structure the last save returned, so a quick second edit
// can't send a structure that's missing the first. A failed save bumps failedSaveCount, which puts back
// the names typed into the inputs
const useTeamStructureEdits = (orgId: string, levels: readonly TeamStructureLevelData[]) => {
  const atmosphere = useAtmosphere()
  const [execute] = useSetTeamStructureMutation()
  const queuedEdits = useRef<TeamStructureEdit[]>([])
  const isSaving = useRef(false)
  const [failedSaveCount, setFailedSaveCount] = useState(0)
  const stopSaving = (message: string) => {
    queuedEdits.current = []
    isSaving.current = false
    setFailedSaveCount((count) => count + 1)
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'teamStructureError',
      message,
      autoDismiss: 5
    })
  }
  const saveNext = (savedLevels: readonly TeamStructureLevelData[]) => {
    const edit = queuedEdits.current.shift()
    isSaving.current = !!edit
    if (!edit) return
    execute({
      variables: {orgId, levels: edit(toTeamStructureInput(savedLevels))},
      onCompleted: (response, errors) => {
        const [error] = errors ?? []
        if (error) stopSaving(error.message)
        else saveNext(response.setTeamStructure.organization.teamStructure)
      },
      onError: (error) => stopSaving(error.message)
    })
  }
  const commit = (edit: TeamStructureEdit) => {
    queuedEdits.current.push(edit)
    if (!isSaving.current) saveNext(levels)
  }
  return [commit, failedSaveCount] as const
}

export default useTeamStructureEdits
