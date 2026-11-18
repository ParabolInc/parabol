import {useState} from 'react'
import {Lock, Schedule} from '~/ui/icons'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useRequestPageAccessMutation} from '../../../mutations/useRequestPageAccessMutation'
import {Button} from '../../../ui/Button/Button'
import {GQLID} from '../../../utils/GQLID'
import getMutationError from '../../../utils/relay/getMutationError'
import {SyncedBlockPanel} from './SyncedBlockPanel'

interface Props {
  pageCode: number
}

export const SyncedBlockLockedPanel = (props: Props) => {
  const {pageCode} = props
  const atmosphere = useAtmosphere()
  const [execute, submitting] = useRequestPageAccessMutation()
  const [isRequested, setIsRequested] = useState(false)

  if (!atmosphere.authObj) {
    return <SyncedBlockPanel icon={Lock}>Part of this page is private.</SyncedBlockPanel>
  }
  if (isRequested) {
    return (
      <SyncedBlockPanel icon={Schedule}>
        Access requested. You can see this block once the owner approves.
      </SyncedBlockPanel>
    )
  }

  const handleResult = (code: unknown) => {
    if (!code || code === 'TOO_MANY_REQUESTS') {
      setIsRequested(true)
      return
    }
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: "Couldn't request access. Try again.",
      autoDismiss: 10,
      key: 'syncedBlockAccessRequestFailed'
    })
  }

  const requestAccess = () => {
    if (submitting) return
    execute({
      variables: {pageId: GQLID.toKey(pageCode, 'page'), reason: '', role: 'viewer'},
      onError: (error) => handleResult(getMutationError(error).code ?? 'ERROR'),
      onCompleted: (_result, errors) => {
        const firstError = errors?.[0]
        handleResult(firstError ? (firstError.extensions?.code ?? 'ERROR') : undefined)
      }
    })
  }

  return (
    <SyncedBlockPanel
      icon={Lock}
      action={
        <Button variant='outline' size='sm' disabled={submitting} onClick={requestAccess}>
          Request access
        </Button>
      }
    >
      You don't have access to this synced block.
    </SyncedBlockPanel>
  )
}
