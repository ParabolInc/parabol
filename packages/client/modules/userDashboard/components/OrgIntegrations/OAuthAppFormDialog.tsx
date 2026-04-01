import {Dialog} from '../../../../ui/Dialog/Dialog'
import OAuthAppFormContent from './OAuthAppFormContent'
import OAuthAppFormEdit from './OAuthAppFormEdit'

interface Props {
  orgId: string
  providerId: string | null // null for new, ID for edit
  isOpen: boolean
  onClose: () => void
}

const OAuthAppFormDialog = ({orgId, providerId, isOpen, onClose}: Props) => {
  const isNew = !providerId

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      {isNew ? (
        <OAuthAppFormContent orgId={orgId} isNew={true} initialData={null} onClose={onClose} />
      ) : (
        <OAuthAppFormEdit orgId={orgId} providerId={providerId!} onClose={onClose} />
      )}
    </Dialog>
  )
}

export default OAuthAppFormDialog
