import React from 'react'
import styled from '@emotion/styled'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

const HeaderCardWrapper = styled('div')({
  display: 'flex',
  padding: '4px 24px'
})

const HeaderCard = styled('div')({
  background: '#fff',
  borderRadius: '4px',
  boxShadow: Elevation.Z3,
  flexDirection: 'row',
  flexWrap: 'wrap',
  height: 86,
  padding: '12px 16px',
  position: 'relative',
  width: 624
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  fontWeight: 600
})

const CardIcons = styled('div')({
  display: 'flex'
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
})

const CardDescription = styled('h2')({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  width: '100%'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

const StyledLink = styled('span')({
  color: PALETTE.LINK_BLUE,
  cursor: 'pointer',
  lineHeight: '20px',
  display: 'flex',
  ':hover, :focus, :active': {
    color: PALETTE.LINK_BLUE_HOVER
  }
})

const StyledLabel = styled('span')({
  fontSize: 12,
  outline: 0
})

const PokerEstimateHeaderCard = () => {
  return (
    <HeaderCardWrapper>
      <HeaderCard>
        <CardTitleWrapper>
          <CardTitle>Video UX researched</CardTitle>
          <CardIcons>
            <CardButton>
              <IconLabel icon='publish' />
            </CardButton>
            <CardButton>
              <IconLabel icon='unfold_more' />
            </CardButton>
          </CardIcons>
        </CardTitleWrapper>
        <CardDescription>This is the first line of acceptance...</CardDescription>
        <StyledLink>
          <StyledLabel>CTD-344</StyledLabel>
          <StyledIcon>launch</StyledIcon>
        </StyledLink>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default PokerEstimateHeaderCard
