import PropTypes from 'prop-types'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import DashNavItem from 'universal/components/Dashboard/DashNavItem'
import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const WarningIcon = styled(Icon)({
  color: appTheme.palette.light,
  fontSize: MD_ICONS_SIZE_18,
  position: 'absolute',
  left: '.625rem'
})

const IconAndLink = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative'
})

const DashNavTeam = (props) => {
  const {team} = props
  return (
    <IconAndLink>
      {!team.isPaid && <WarningIcon title="Team is disabled for nonpayment">warning</WarningIcon>}
      <DashNavItem
        href={`/team/${team.id}`}
        label={team.name}
        icon={team.isPaid ? 'group' : undefined}
      />
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
