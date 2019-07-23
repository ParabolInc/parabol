import PropTypes from 'prop-types'
import React from 'react'
import SettingsHeader from 'universal/modules/userDashboard/components/SettingsHeader/SettingsHeader'
import styled from '@emotion/styled'
import ui from 'universal/styles/ui'
import DashMain from 'universal/components/Dashboard/DashMain'
import DashHeader from 'universal/components/Dashboard/DashHeader'
import DashContent from 'universal/components/Dashboard/DashContent'

const SettingsContentBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: ui.settingsPanelMaxWidth,
  width: '100%'
})

const UserSettingsWrapper = (props) => {
  const {children} = props
  return (
    <DashMain>
      <DashHeader>
        <SettingsHeader />
      </DashHeader>
      <DashContent padding='0 16px'>
        <SettingsContentBlock>{children}</SettingsContentBlock>
      </DashContent>
    </DashMain>
  )
}

UserSettingsWrapper.propTypes = {
  children: PropTypes.any
}

export default UserSettingsWrapper
