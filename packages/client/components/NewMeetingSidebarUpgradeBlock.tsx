import styled from '@emotion/styled'
import React from 'react'
import {useHistory} from 'react-router'
import {PALETTE} from '../styles/paletteV3'
import FlatPrimaryButton from './FlatPrimaryButton'

const RootBlock = styled('div')({
  padding: '16px 8px'
})

const Container = styled('div')({
  background: PALETTE.SLATE_200,
  border: `2px solid ${PALETTE.GRAPE_500}`,
  padding: 12,
  borderRadius: 4
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

const UpgradeButton = styled(FlatPrimaryButton)({
  width: '100%'
})

interface Props {
  onClick?: () => void
  orgId: string
}

const NewMeetingSidebarUpgradeBlock = (props: Props) => {
  const {onClick, orgId} = props
  const history = useHistory()

  const handleClick = () => {
    onClick && onClick()
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <RootBlock>
      <Container>
        <Heading>🎉 We’re glad you love Parabol!</Heading>

        <Description>
          You've exceeded the two-team limit. To make sure you don't lose access, upgrade to the
          Team plan so you can have as many teams as you need.
        </Description>

        <Action>
          <UpgradeButton onClick={handleClick} size='small'>
            Upgrade
          </UpgradeButton>
        </Action>
      </Container>
    </RootBlock>
  )
}

export default NewMeetingSidebarUpgradeBlock
