import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Helmet from 'react-helmet'
import EmptyOrgsCallOut from 'universal/modules/userDashboard/components/EmptyOrgsCallOut/EmptyOrgsCallOut'
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow'
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper'
import {withRouter} from 'react-router-dom'
import Button from 'universal/components/Button'
import Panel from 'universal/components/Panel/Panel'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'

const Organizations = (props) => {
  const {history, viewer} = props
  const {organizations} = viewer
  const gotoNewTeam = () => {
    history.push('/newteam')
  }
  const addNewOrg = () => (
    <Button
      aria-label='Tap to create a new organzation'
      buttonSize='small'
      buttonStyle='link'
      colorPalette='dark'
      icon='plus-circle'
      label='Add New Organization'
      onClick={gotoNewTeam}
    />
  )

  return (
    <UserSettingsWrapper>
      <Helmet title='My Organizations | Parabol' />
      <SettingsWrapper>
        {organizations.length ? (
          <Panel label='Organizations' controls={addNewOrg()}>
            {organizations.map((organization) => (
              <OrganizationRow key={`orgRow${organization.id}`} organization={organization} />
            ))}
          </Panel>
        ) : (
          <EmptyOrgsCallOut />
        )}
      </SettingsWrapper>
    </UserSettingsWrapper>
  )
}

Organizations.propTypes = {
  viewer: PropTypes.object,
  history: PropTypes.object
}

export default createFragmentContainer(
  withRouter(Organizations),
  graphql`
    fragment Organizations_viewer on User {
      organizations {
        id
        isBillingLeader
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        name
        picture
        tier
      }
    }
  `
)
