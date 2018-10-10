import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import ui from 'universal/styles/ui'
import ToggleNav from 'universal/components/ToggleNav/ToggleNav'

const TeamSettingsToggleNav = (props) => {
  const {activeKey, history, teamId} = props
  const makeOnClick = (area = '') => {
    return area === activeKey
      ? undefined
      : () => {
        history.push(`/team/${teamId}/settings/${area}`)
      }
  }

  const items = [
    {
      label: 'Team',
      icon: 'group',
      isActive: activeKey === '',
      onClick: makeOnClick()
    },
    {
      label: 'Integrations',
      icon: 'extension',
      isActive: activeKey === 'integrations',
      onClick: makeOnClick('integrations')
    }
  ]

  const wrapperStyle = {
    margin: `${ui.panelMarginVertical} auto 0`,
    maxWidth: ui.settingsPanelMaxWidth,
    width: '100%'
  }

  return (
    <div style={wrapperStyle}>
      <ToggleNav items={items} />
    </div>
  )
}

TeamSettingsToggleNav.propTypes = {
  activeKey: PropTypes.string,
  history: PropTypes.object,
  teamId: PropTypes.string
}

export default withRouter(TeamSettingsToggleNav)
