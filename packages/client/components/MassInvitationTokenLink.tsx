import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {MassInvitationTokenLinkQuery} from '../__generated__/MassInvitationTokenLinkQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import CopyShortLink from '../modules/meeting/components/CopyShortLink/CopyShortLink'
import {PALETTE} from '../styles/paletteV3'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'

const StyledCopyShortLink = styled(CopyShortLink)({
  borderRadius: 4,
  border: `1px dashed ${PALETTE.SKY_400}`,
  color: PALETTE.SKY_500,
  fontSize: 15,
  fontWeight: 600,
  padding: 11,
  ':hover': {
    color: PALETTE.SKY_400
  }
})

interface Props {
  meetingId: string | undefined
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
  const {meetingId, queryRef} = props
  const data = usePreloadedQuery<MassInvitationTokenLinkQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  const {id: teamId, massInvitation} = team!
  const atmosphere = useAtmosphere()
  const {id: token} = massInvitation!
  const onCopy = () => {
    SendClientSideEvent(atmosphere, 'Copied Invite Link', {
      teamId: teamId,
      meetingId: meetingId
    })
  }
  const url = getMassInvitationUrl(token)
  const linkLabel = url.replace(/https?:\/\//, '')
  return (
    <StyledCopyShortLink
      icon='link'
      url={url}
      label={linkLabel}
      title={'Copy invite link'}
      tooltip={'Copied! Valid for 30 days'}
      onCopy={onCopy}
    />
  )
}

export default MassInvitationTokenLink
