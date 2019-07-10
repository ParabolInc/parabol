import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import DashHeaderTitle from 'universal/components/DashHeaderTitle'

const Root = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const Title = styled(DashHeaderTitle)({
  marginRight: 32
})

const TeamDashHeaderInfo = (props) => {
  const {children, title} = props
  return (
    <Root>
      {title && <Title>{title}</Title>}
      {children}
    </Root>
  )
}

TeamDashHeaderInfo.propTypes = {
  children: PropTypes.any,
  title: PropTypes.any,
  isSettings: PropTypes.bool
}

export default TeamDashHeaderInfo
