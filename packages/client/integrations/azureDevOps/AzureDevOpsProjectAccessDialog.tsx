import {Suspense} from 'react'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {Spinner} from '../../ui/Spinner/Spinner'
import AzureDevOpsProjectAccessFormRoot from './AzureDevOpsProjectAccessFormRoot'

interface Props {
  teamId: string
  isOpen: boolean
  onClose: () => void
}

const AzureDevOpsProjectAccessDialog = (props: Props) => {
  const {teamId, isOpen, onClose} = props
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='md:w-xl md:max-w-xl'>
        <DialogTitle>Azure DevOps project access</DialogTitle>
        <DialogDescription className='mb-4 text-fg-secondary text-sm'>
          Choose what this team can reach through your Azure DevOps account. Parabol reads and
          updates work items in the projects you share, and never your source code.
        </DialogDescription>
        <Suspense fallback={<Spinner className='mx-auto my-12 size-6' />}>
          <AzureDevOpsProjectAccessFormRoot teamId={teamId} onClose={onClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}

export default AzureDevOpsProjectAccessDialog
