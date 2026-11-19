import OAuthAppFormContent from './OAuthAppFormContent'

const OAuthAppFormNew = ({orgId, onClose}: {orgId: string; onClose: () => void}) => {
  return <OAuthAppFormContent orgId={orgId} isNew={true} onClose={onClose} />
}

export default OAuthAppFormNew
