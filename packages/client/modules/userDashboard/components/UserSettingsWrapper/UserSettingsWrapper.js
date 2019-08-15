import PropTypes from 'prop-types'
import React from 'react'
import SettingsHeader from '../SettingsHeader/SettingsHeader'
import styled from '@emotion/styled'
import ui from '../../../../styles/ui'
import DashHeader from '../../../../components/Dashboard/DashHeader'
import DashContent from '../../../../components/Dashboard/DashContent'

const SettingsContentBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: ui.settingsPanelMaxWidth,
  width: '100%'
})

const Content = styled(DashContent)({
  padding: '0 16px'
})

const UserSettingsWrapper = (props) => {
  const {children} = props
  return (
    <>
      <DashHeader>
        <SettingsHeader />
      </DashHeader>
      <Content>
        <SettingsContentBlock>{children}</SettingsContentBlock>
      </Content>
    </>
  )
}

UserSettingsWrapper.propTypes = {
  children: PropTypes.any
}

export default UserSettingsWrapper
