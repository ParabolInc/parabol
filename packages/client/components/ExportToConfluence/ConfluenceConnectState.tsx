import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../../hooks/useMutationProps'
import {Button} from '../../ui/Button/Button'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import AtlassianClientManager, {ERROR_POPUP_CLOSED} from '../../utils/AtlassianClientManager'

interface Props {
  teamId: string | null
  onAuthed: () => void
}

export const ConfluenceConnectState = (props: Props) => {
  const {teamId, onAuthed} = props
  const atmosphere = useAtmosphere()
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
    // fresh connection from the export flow: Confluence only — Jira is opt-in
    // from /integrations (offline_access is required for refresh tokens)
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps, [
      ...AtlassianClientManager.CONFLUENCE_SCOPE,
      'offline_access' as const
    ])
  }

  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>Connect your Atlassian account</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        Export this page as a native Confluence page — headings, tables, task lists, and images
        included. We&apos;ll open a secure Atlassian sign-in window.
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
