import {useEffect} from 'react'
import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../../hooks/useMutationProps'
import {Button} from '../../ui/Button/Button'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import AtlassianClientManager, {ERROR_POPUP_CLOSED} from '../../utils/AtlassianClientManager'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

interface Props {
  teamId: string | null
  heldScopes?: readonly string[] | null
  onAuthed: () => void
}

export const ConfluenceConnectState = (props: Props) => {
  const {teamId, heldScopes, onAuthed} = props
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Confluence Export Connect Shown')
  }, [atmosphere])
  const {submitting, submitMutation, onError, onCompleted, error} = useMutationProps()
  const mutationProps = {
    submitting,
    submitMutation,
    onError,
    onCompleted: () => {
      onCompleted()
      onAuthed()
    }
  } as MenuMutationProps

  const connect = () => {
    if (submitting || !teamId) return
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      mutationProps,
      [...AtlassianClientManager.CONFLUENCE_SCOPE, 'offline_access' as const],
      heldScopes
    )
  }

  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>Connect your Atlassian account</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        {
          "Export this page as a native Confluence page — headings, tables, task lists, and images included. We'll open a secure Atlassian sign-in window."
        }
      </p>
      <Button variant='dialogPrimary' size='md' onClick={connect} disabled={submitting || !teamId}>
        Connect Atlassian
      </Button>
      {error && (
        <p className='m-0 text-fg-error text-sm'>
          {error.message === ERROR_POPUP_CLOSED
            ? 'The Atlassian sign-in window was closed before finishing. Click Connect to try again.'
            : error.message}
        </p>
      )}
    </div>
  )
}
