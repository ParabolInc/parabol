import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import OAuthAppFormContent from './OAuthAppFormContent'

const generateCredentialsQuery = graphql`
  query OAuthAppFormNewGenerateCredentialsQuery {
    generateOAuthCredentials {
      clientId
      clientSecret
    }
  }
`

const OAuthAppFormNew = ({orgId, onClose}: {orgId: string; onClose: () => void}) => {
  const data = useLazyLoadQuery<any>(generateCredentialsQuery, {}, {fetchPolicy: 'network-only'})

  const initialData = {
    clientId: data.generateOAuthCredentials.clientId,
    clientSecret: data.generateOAuthCredentials.clientSecret,
    scopes: []
  }

  return (
    <OAuthAppFormContent orgId={orgId} isNew={true} initialData={initialData} onClose={onClose} />
  )
}

export default OAuthAppFormNew
