import styled from '@emotion/styled'
import React from 'react'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {FONT_FAMILY} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV3'
import {Link} from 'react-router-dom'
import Atmosphere from '../Atmosphere'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from '../hooks/useAtmosphere'

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
  message: string
}
const MeetingsDashNoFilteredResults = (props: Props) => {
  const {name, message} = props
  const clearDashSearch = (atmosphere: Atmosphere) => {
    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!viewer) return
      viewer.setValue(null, 'dashSearch')
    })
  }

  const atmosphere = useAtmosphere()
  const onClick = () => {
    clearDashSearch(atmosphere)
  }
  return (
    <Section>
      <Heading>{`Hi ${name},`}</Heading>
      <Copy>
        {message}
        <Link to={'/meetings'} style={linkStyle} onClick={onClick}>
          {' Click here'}
        </Link>
        {'  to see meetings on all of your teams.'}
      </Copy>
    </Section>
  )
}

export default MeetingsDashNoFilteredResults
