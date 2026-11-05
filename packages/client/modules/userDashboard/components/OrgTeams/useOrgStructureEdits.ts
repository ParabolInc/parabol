import {useRef, useState} from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useSetOrgStructureMutation from '../../../../mutations/useSetOrgStructureMutation'
import {
  type OrgStructureEdit,
  type OrgStructureLevelData,
  toOrgStructureInput
} from './orgStructureEdits'

// Saves edits one at a time, each on top of the structure the last save returned, so a quick second edit
// can't send a structure that's missing the first. A failed save bumps failedSaveCount, which puts back
// the names typed into the inputs
const useOrgStructureEdits = (orgId: string, levels: readonly OrgStructureLevelData[]) => {
  const atmosphere = useAtmosphere()
  const [execute] = useSetOrgStructureMutation()
  const queuedEdits = useRef<OrgStructureEdit[]>([])
  const isSaving = useRef(false)
  const [failedSaveCount, setFailedSaveCount] = useState(0)
  const stopSaving = (message: string) => {
    queuedEdits.current = []
    isSaving.current = false
    setFailedSaveCount((count) => count + 1)
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'orgStructureError',
      message,
      autoDismiss: 5
    })
  }
  const saveNext = (savedLevels: readonly OrgStructureLevelData[]) => {
    const edit = queuedEdits.current.shift()
    isSaving.current = !!edit
    if (!edit) return
    execute({
      variables: {orgId, levels: edit(toOrgStructureInput(savedLevels))},
      onCompleted: (response, errors) => {
        const [error] = errors ?? []
        if (error) stopSaving(error.message)
        else saveNext(response.setOrgStructure.organization.structure)
      },
      onError: (error) => stopSaving(error.message)
    })
  }
  const commit = (edit: OrgStructureEdit) => {
    queuedEdits.current.push(edit)
    if (!isSaving.current) saveNext(levels)
  }
  return [commit, failedSaveCount] as const
}

export default useOrgStructureEdits
