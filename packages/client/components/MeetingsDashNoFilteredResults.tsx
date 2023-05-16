import styled from '@emotion/styled'
import React from 'react'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {FONT_FAMILY} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV3'

const maybeTabletPlusMediaQuery = makeMinWidthMediaQuery(Breakpoint.FUZZY_TABLET)

const Section = styled('div')({
  margin: 8,
  padding: 0
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

const linkStyle = {
  color: PALETTE.SKY_500,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  textDecoration: 'none'
}

interface Props {
  name: string
}
const MeetingsDashNoFilteredResults = (props: Props) => {
  const {name} = props
  return (
    <Section>
      <Heading>{`Hi ${name},`}</Heading>
      <Copy>
        {'Sorry we could not find any meetings matched with your query. '}
        <a href={'/meetings'} style={linkStyle}>
          Click here
        </a>
        {'  to see all meetings.'}
      </Copy>
    </Section>
  )
}

export default MeetingsDashNoFilteredResults
