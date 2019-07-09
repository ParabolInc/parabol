import PropTypes from 'prop-types'
import React from 'react'
import DashHeaderTitle from 'universal/components/DashHeaderTitle'
import Icon from 'universal/components/Icon'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import useBreakpoint from 'universal/hooks/useBreakpoint'
import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'

const Root = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const Title = styled(DashHeaderTitle)({
  marginRight: 32
})

const MenuIcon = styled(Icon)({
  color: PALETTE.TEXT_LIGHT,
  cursor: 'pointer',
  display: 'block',
  marginRight: 16,
  userSelect: 'none'
})

const TeamDashHeaderInfo = (props) => {
  const {children, title, isSettings} = props
  const isDesktop = useBreakpoint(DASH_SIDEBAR.BREAKPOINT)
  const handleOnClick = () => {
    if (isSettings) return console.log('go back to team')
    return console.log('open menu')
  }
  const icon = isSettings ? 'arrow_back' : 'menu'
  return (
    <Root>
      {!isDesktop && <MenuIcon onClick={handleOnClick}>{icon}</MenuIcon>}
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
