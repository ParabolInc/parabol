import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OAuthAppFormEditQuery} from '../../../../__generated__/OAuthAppFormEditQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OAuthAppFormContent from './OAuthAppFormContent'

graphql`
  fragment OAuthAppFormEdit_oauthProvider on OAuthAPIProvider {
    id
    name
    clientId
    clientType
    redirectUris
    scopes
  }
`

const query = graphql`
  query OAuthAppFormEditQuery($orgId: ID!, $providerId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        oauthAPIProvider(providerId: $providerId) {
          ...OAuthAppFormEdit_oauthProvider @relay(mask: false)
        }
      }
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
  const queryRef = useQueryLoaderNow<OAuthAppFormEditQuery>(query, {orgId, providerId})

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
  queryRef: PreloadedQuery<OAuthAppFormEditQuery>
  orgId: string
  isNew: boolean
  onClose: () => void
}) => {
  const data = usePreloadedQuery<OAuthAppFormEditQuery>(query, queryRef)
  const provider = data.viewer.organization?.oauthAPIProvider

  if (!provider && !isNew) {
    return <div className='p-6'>Provider not found</div>
  }

  return (
    <OAuthAppFormContent
      orgId={orgId}
      isNew={isNew}
      initialData={provider || null}
      onClose={onClose}
    />
  )
}

export default OAuthAppFormEdit
