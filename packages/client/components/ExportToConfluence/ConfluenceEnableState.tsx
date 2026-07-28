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

export const ConfluenceEnableState = (props: Props) => {
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

  const enable = () => {
    if (submitting || !teamId) return
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps, [
      ...AtlassianClientManager.SCOPE,
      ...AtlassianClientManager.CONFLUENCE_SCOPE
    ])
  }

  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>Your Atlassian connection doesn&apos;t include Confluence yet</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        Grant Confluence permissions to export pages. Jira keeps working as-is — this adds, it
        doesn&apos;t replace.
      </p>
      <Button variant='dialogPrimary' size='md' onClick={enable} disabled={submitting || !teamId}>
        Enable Confluence
      </Button>
    </div>
  )
}
