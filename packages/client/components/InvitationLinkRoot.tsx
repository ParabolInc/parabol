import {Suspense} from 'react'
import {useParams} from 'react-router-dom'
import invitationLinkQuery, {
  type InvitationLinkQuery
} from '~/__generated__/InvitationLinkQuery.graphql'
import useNoIndex from '../hooks/useNoIndex'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import InvitationLink from './InvitationLink'

const InvitationLinkRoot = () => {
  useNoIndex()
  const {token} = useParams()
  const queryRef = useQueryLoaderNow<InvitationLinkQuery>(invitationLinkQuery, {
    token: token!
  })
  return <Suspense fallback={''}>{queryRef && <InvitationLink queryRef={queryRef} />}</Suspense>
}

export default InvitationLinkRoot
