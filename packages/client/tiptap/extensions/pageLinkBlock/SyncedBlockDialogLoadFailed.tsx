import {useEffect} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {snackOnError} from '../../../mutations/handlers/snackOnError'

interface Props {
  message: string
  onClose: () => void
}

export const SyncedBlockDialogLoadFailed = ({message, onClose}: Props) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    snackOnError(atmosphere)({message})
    onClose()
  }, [])
  return null
}
