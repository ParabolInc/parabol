import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import DashContent from '../../../../components/Dashboard/DashContent'
import {Layout} from 'types/constEnums'

const SettingsContentBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: Layout.SETTINGS_MAX_WIDTH,
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
