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

export const ConfluenceEnableState = (props: Props) => {
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

  const enable = () => {
    if (submitting || !teamId) return
    // intent: Confluence — openOAuth unions in the held products (the modal query
    // fetched hasJiraScopes, so an existing Jira grant is preserved automatically)
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps, [
      ...AtlassianClientManager.CONFLUENCE_SCOPE,
      'offline_access' as const
    ])
  }

  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>Your Atlassian connection doesn&apos;t include Confluence yet</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        Grant Confluence permissions to export pages. Jira keeps working as-is — this adds, it
        doesn&apos;t replace. We&apos;ll open a secure Atlassian sign-in window.
      </p>
      <Button variant='dialogPrimary' size='md' onClick={enable} disabled={submitting || !teamId}>
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
