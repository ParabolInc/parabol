import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import DashContent from '../../../../components/Dashboard/DashContent'
import ui from '../../../../styles/ui'

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

interface Props {
  children: ReactNode
}
const UserSettingsWrapper = (props: Props) => {
  const {children} = props
  return (
    <Content>
      <SettingsContentBlock>{children}</SettingsContentBlock>
    </Content>
  )
}

export default UserSettingsWrapper
