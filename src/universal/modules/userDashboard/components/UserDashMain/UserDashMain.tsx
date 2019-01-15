import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import DashContent from 'universal/components/Dashboard/DashContent'
import DashHeader from 'universal/components/Dashboard/DashHeader'
import DashMain from 'universal/components/Dashboard/DashMain'
import MyDashboardTasksRoot from 'universal/components/MyDashboardTasksRoot'
import Tab from 'universal/components/Tab/Tab'
import Tabs from 'universal/components/Tabs/Tabs'

import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import makeDateString from 'universal/utils/makeDateString'

const LayoutBlock = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

const HeaderCopy = styled('div')({
  color: ui.colorText,
  flex: 1,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: '1.25',
  textAlign: 'right'
})

const RallyLink = styled('span')({
  color: 'inherit',
  fontWeight: 400,
  fontStyle: 'italic'
})

const TopTabs = styled(Tabs)({
  marginTop: 8
})
const UserDashMain = () => {
  return (
    <DashMain>
      <Helmet title='My Dashboard | Parabol' />
      <DashHeader area='userDash'>
        <TopTabs activeIdx={0}>
          <Tab label='TIMELINE' />
          <Tab label='TASKS' />
        </TopTabs>
        <HeaderCopy>
          {makeDateString(new Date(), {showDay: true})} *
          <RallyLink>
            {getRallyLink()}
            {'!'}
          </RallyLink>
        </HeaderCopy>
      </DashHeader>
      <DashContent padding='0'>
        <LayoutBlock>
          <MyDashboardTasksRoot />
        </LayoutBlock>
      </DashContent>
    </DashMain>
  )
}

export default UserDashMain
