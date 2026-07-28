import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../../hooks/useMutationProps'
import {Button} from '../../ui/Button/Button'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import AtlassianClientManager from '../../utils/AtlassianClientManager'

interface Props {
  teamId: string | null
  onAuthed: () => void
}

export const ConfluenceConnectState = (props: Props) => {
  const {teamId, onAuthed} = props
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
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
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps, [
      ...AtlassianClientManager.SCOPE,
      ...AtlassianClientManager.CONFLUENCE_SCOPE
    ])
  }

  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>Connect your Atlassian account</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        Export this page as a native Confluence page — headings, tables, task lists, and images
        included.
      </p>
      <Button variant='dialogPrimary' size='md' onClick={connect} disabled={submitting || !teamId}>
        Connect Atlassian
      </Button>
    </div>
  )
}
