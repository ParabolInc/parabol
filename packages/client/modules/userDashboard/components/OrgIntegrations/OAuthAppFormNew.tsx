import OAuthAppFormContent from './OAuthAppFormContent'

const OAuthAppFormNew = ({orgId, onClose}: {orgId: string; onClose: () => void}) => {
  const initialData = {
    clientId: '',
    clientSecret: '',
    scopes: []
  }

  return (
    <OAuthAppFormContent orgId={orgId} isNew={true} initialData={initialData} onClose={onClose} />
  )
}

export default OAuthAppFormNew
