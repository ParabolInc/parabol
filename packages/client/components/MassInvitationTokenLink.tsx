import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {MassInvitationTokenLinkQuery} from '../__generated__/MassInvitationTokenLinkQuery.graphql'
import CopyShortLink from '../modules/meeting/components/CopyShortLink/CopyShortLink'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'

interface Props {
  queryRef: PreloadedQuery<MassInvitationTokenLinkQuery>
}

const query = graphql`
  query MassInvitationTokenLinkQuery($teamId: ID!, $meetingId: ID) {
    viewer {
      team(teamId: $teamId) {
        id
        massInvitation(meetingId: $meetingId) {
          id
          expiration
        }
      }
    }
  }
`

const MassInvitationTokenLink = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<MassInvitationTokenLinkQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  const {massInvitation} = team!
  const {id: token} = massInvitation!
  const url = getMassInvitationUrl(token)
  const linkLabel = url.replace(/https?:\/\//, '')
  return (
    <CopyShortLink
      className='rounded border border-sky-400 border-dashed p-[11px] font-semibold text-[15px] text-sky-500 hover:text-sky-400'
      icon='link'
      url={url}
      label={linkLabel}
      title={'Copy invite link'}
      tooltip={'Copied! Valid for 30 days'}
    />
  )
}

export default MassInvitationTokenLink
