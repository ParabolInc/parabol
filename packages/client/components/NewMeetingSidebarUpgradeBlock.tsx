import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import {useHistory} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../styles/paletteV3'
import FlatPrimaryButton from './FlatPrimaryButton'
import IconButton from './IconButton'

const RootBlock = styled('div')({
  padding: '16px 8px'
})

const Container = styled('div')({
  background: PALETTE.SLATE_200,
  border: `2px solid ${PALETTE.GRAPE_500}`,
  padding: 12,
  borderRadius: 4,
  position: 'relative'
})

const Heading = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: '14px',
  lineHeight: '16px',
  fontWeight: 600
})

const Description = styled('div')({
  color: PALETTE.SLATE_900,
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: 8
})

const Action = styled('div')({
  marginTop: 8
})

const MEDIA_QUERY_SMALL_HEIGHT = `@media screen and (min-height: 650px)`

const CloseButtonWrapper = styled('div')({
  marginBottom: '6px',
  [MEDIA_QUERY_SMALL_HEIGHT]: {
    display: 'none'
  }
})

const CloseButton = styled(IconButton)({
  opacity: 0.75,
  padding: 0,
  position: 'absolute',
  right: 2,
  top: 2
})

const UpgradeButton = styled(FlatPrimaryButton)({
  width: '100%'
})

interface Props {
  onClick?: () => void
  orgId: string
  meetingId: string
}

const NewMeetingSidebarUpgradeBlock = (props: Props) => {
  const {onClick, orgId, meetingId} = props
  const history = useHistory()
  const [closed, setClosed] = React.useState(false)
  const atmosphere = useAtmosphere()

  const handleUpgradeClick = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'meetingSidebar',
      orgId,
      meetingId
    })
    onClick?.()
    history.push(`/me/organizations/${orgId}`)
  }

  const handleClose = () => {
    setClosed(true)
  }

  useEffect(() => {
    if (!closed) {
      SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Viewed', {
        upgradeCTALocation: 'meetingSidebar',
        orgId,
        meetingId
      })
    }
  }, [closed])

  if (closed) {
    return null
  }

  return (
    <RootBlock>
      <Container>
        <CloseButtonWrapper>
          <CloseButton icon='close' palette='midGray' onClick={handleClose} />
        </CloseButtonWrapper>
        <Heading>🎉 We’re glad you love Parabol!</Heading>
        <Description>
          You've exceeded the two-team limit. To make sure you don't lose access, upgrade to the
          Team plan so you can have as many teams as you need.
        </Description>

        <Action>
          <UpgradeButton onClick={handleUpgradeClick} size='small'>
            Upgrade
          </UpgradeButton>
        </Action>
      </Container>
    </RootBlock>
  )
}

export default NewMeetingSidebarUpgradeBlock
