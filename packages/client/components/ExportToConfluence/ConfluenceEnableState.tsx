import {useEffect} from 'react'
import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../../hooks/useMutationProps'
import type {ConnectProvider} from '../../integrations/platform/ClientIntegrationDefinition'
import {Button} from '../../ui/Button/Button'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import AtlassianClientManager, {ERROR_POPUP_CLOSED} from '../../utils/AtlassianClientManager'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

interface Props {
  teamId: string | null
  provider: ConnectProvider | null
  heldScopes?: readonly string[] | null
  onAuthed: () => void
}

export const ConfluenceEnableState = (props: Props) => {
  const {teamId, provider, heldScopes, onAuthed} = props
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Confluence Export Enable Shown')
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

  const enable = () => {
    if (submitting || !teamId || !provider) return
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      provider,
      mutationProps,
      [...AtlassianClientManager.CONFLUENCE_SCOPE, 'offline_access' as const],
      heldScopes
    )
  }

  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>{"Your Atlassian connection doesn't include Confluence yet"}</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        {
          "Grant Confluence permissions to export pages. Jira keeps working as-is — this adds, it doesn't replace. We'll open a secure Atlassian sign-in window."
        }
      </p>
      <Button
        variant='dialogPrimary'
        size='md'
        onClick={enable}
        disabled={submitting || !teamId || !provider}
      >
        Enable Confluence
      </Button>
      {error && (
        <p className='m-0 text-fg-error text-sm'>
          {error.message === ERROR_POPUP_CLOSED
            ? 'The Atlassian sign-in window was closed before finishing. Click Enable to try again.'
            : error.message}
        </p>
      )}
    </div>
  )
}
