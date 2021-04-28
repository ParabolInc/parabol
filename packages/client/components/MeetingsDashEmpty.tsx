import styled from '@emotion/styled'
import React from 'react'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import plantAndCoffee from '../../../static/images/illustrations/plant-and-coffee.svg'

const maybeTabletPlusMediaQuery = makeMinWidthMediaQuery(Breakpoint.FUZZY_TABLET)

const Wrapper = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.WHITE,
  boxShadow: Elevation.Z1,
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto auto',
  maxWidth: '100%',
  padding: 24,
  [maybeTabletPlusMediaQuery]: {
    flexDirection: 'row',
    margin: 'auto',
    padding: '56px 80px',
    width: 'auto'
  }
})

const Section = styled('div')({
  margin: 0,
  padding: 0
})

const Img = styled('img')({
  display: 'block',
  margin: '0 auto 24px',
  width: 160,
  [maybeTabletPlusMediaQuery]: {
    margin: '0 56px 0 0',
    width: 'auto'
  }
})

const Heading = styled('h1')({
  fontSize: 24,
  margin: '0 0 16px',
  padding: 0
})

const Copy = styled('p')({
  fontSize: 14,
  lineHeight: '20px',
  margin: 0,
  padding: 0,
  [maybeTabletPlusMediaQuery]: {
    fontSize: 16,
    lineHeight: '24px'
  }
})

const MeetingsDashEmpty = () => {
  return (
    <Wrapper>
      <Section>
        <Img src={plantAndCoffee} />
      </Section>
      <Section>
        <Heading>{'All caught up on meetings?'}</Heading>
        <Copy>{'High five! 🙌'}</Copy>
        <Copy>{'Now for that sweet focus time…'}</Copy>
        <br />
        <Copy>{'However, if it’s that time again you’ve come to the right place.'}</Copy>
      </Section>
    </Wrapper>
  )
}

export default MeetingsDashEmpty
