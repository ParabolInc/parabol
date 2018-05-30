import PropTypes from 'prop-types'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import DashNavItem from 'universal/components/Dashboard/DashNavItem'
import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'

const WarningIcon = styled(StyledFontAwesome)({
  color: appTheme.palette.light,
  fontSize: `${ui.iconSize} !important`,
  position: 'absolute',
  right: '100%',
  textAlign: 'center',
  width: 24
})

const IconAndLink = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative'
})

const DashNavTeam = ({team}) => {
  return (
    <IconAndLink>
      {!team.isPaid && <WarningIcon name='warning' title='Team is disabled for nonpayment' />}
      <DashNavItem href={`/team/${team.id}`} label={team.name} icon={team.isPaid && 'group'} />
    </IconAndLink>
  )
}

DashNavTeam.propTypes = {
  team: PropTypes.object.isRequired
}

export default createFragmentContainer(
  withRouter(DashNavTeam),
  graphql`
    fragment DashNavTeam_team on Team {
      id
      isPaid
      name
    }
  `
)
