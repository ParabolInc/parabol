import {Dialog} from '../../../../ui/Dialog/Dialog'
import OAuthAppFormEdit from './OAuthAppFormEdit'
import OAuthAppFormNew from './OAuthAppFormNew'

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
        <OAuthAppFormNew orgId={orgId} onClose={onClose} />
      ) : (
        <OAuthAppFormEdit orgId={orgId} providerId={providerId!} onClose={onClose} />
      )}
    </Dialog>
  )
}

export default OAuthAppFormDialog
