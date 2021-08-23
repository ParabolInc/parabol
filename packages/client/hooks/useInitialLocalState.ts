import {useEffect} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

type InitialValue = string | number | boolean | null
const useInitialLocalState = (
  parentDataId: string,
  fieldName: string,
  defaultValue: InitialValue | [never],
  isLinkedRecord?: boolean
) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const record = store.get(parentDataId)
      if (!record) return
      const existingValue = record.getValue(fieldName)
      if (existingValue !== undefined) return
      if (!isLinkedRecord) {
        record.setValue(defaultValue, fieldName)
      } else if (Array.isArray(defaultValue)) {
        record.setLinkedRecords(defaultValue, fieldName)
      } else {
        record.setLinkedRecord(null, fieldName)
      }
    })
  }, [parentDataId])
}

export default useInitialLocalState
