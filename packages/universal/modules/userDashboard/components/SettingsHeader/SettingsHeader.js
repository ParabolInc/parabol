import PropTypes from 'prop-types'
import React from 'react'
import styled from '@emotion/styled'
import {withRouter} from 'react-router-dom'
import {PROFILE, ORGANIZATIONS, NOTIFICATIONS} from 'universal/utils/constants'
import DashHeaderTitle from 'universal/components/DashHeaderTitle'

const heading = {
  [PROFILE]: {
    label: 'Profile'
  },
  [ORGANIZATIONS]: {
    label: 'Organizations'
  },
  [NOTIFICATIONS]: {
    label: 'Notifications'
  }
}

const Root = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const Title = styled(DashHeaderTitle)({
  margin: 0,
  padding: 0
})

const SettingsHeader = (props) => {
  const {location} = props
  const [area] = location.pathname.slice(4).split('/')
  return (
    <Root>
      <Title>{heading[area].label}</Title>
    </Root>
  )
}

SettingsHeader.propTypes = {
  location: PropTypes.object
}

export default withRouter(SettingsHeader)
