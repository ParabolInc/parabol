import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import invitationLinkQuery, {
  type InvitationLinkQuery
} from '~/__generated__/InvitationLinkQuery.graphql'
import useNoIndex from '../hooks/useNoIndex'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import InvitationLink from './InvitationLink'

const InvitationLinkRoot = () => {
  useNoIndex()
  const {token} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<InvitationLinkQuery>(invitationLinkQuery, {
    token: token!
  })
  return <Suspense fallback={''}>{queryRef && <InvitationLink queryRef={queryRef} />}</Suspense>
}

export default InvitationLinkRoot
