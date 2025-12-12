import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery} from 'react-relay'
import type {OAuthAppFormEditQuery} from '../../../../__generated__/OAuthAppFormEditQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OAuthAppFormContent from './OAuthAppFormContent'

const query = graphql`
  query OAuthAppFormEditQuery($providerId: ID!) {
    oauthProvider: oauthAPIProvider(id: $providerId) {
      id
      name
      clientId
      clientSecret
      redirectUris
      scopes
    }
  }
`

const OAuthAppFormEdit = ({
  orgId,
  providerId,
  onClose
}: {
  orgId: string
  providerId: string
  onClose: () => void
}) => {
  const queryRef = useQueryLoaderNow<OAuthAppFormEditQuery>(query, {providerId})

  if (!queryRef) return null // Loading...

  return (
    <OAuthAppFormContentWithData
      queryRef={queryRef}
      orgId={orgId}
      isNew={false}
      onClose={onClose}
    />
  )
}

const OAuthAppFormContentWithData = ({
  queryRef,
  orgId,
  isNew,
  onClose
}: {
  queryRef: any
  orgId: string
  isNew: boolean
  onClose: () => void
}) => {
  const data = usePreloadedQuery<OAuthAppFormEditQuery>(query, queryRef)
  const provider = data.oauthProvider

  if (!provider && !isNew) {
    return <div className='p-6'>Provider not found</div>
  }

  return (
    <OAuthAppFormContent orgId={orgId} isNew={isNew} initialData={provider} onClose={onClose} />
  )
}

export default OAuthAppFormEdit
