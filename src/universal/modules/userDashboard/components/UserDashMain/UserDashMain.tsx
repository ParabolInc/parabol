import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {matchPath, RouteComponentProps, Switch, withRouter} from 'react-router'
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute'
import DashHeader from 'universal/components/Dashboard/DashHeader'
import DashMain from 'universal/components/Dashboard/DashMain'
import Tab from 'universal/components/Tab/Tab'
import Tabs from 'universal/components/Tabs/Tabs'

import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink'
import appTheme from 'universal/styles/theme/appTheme'
import makeDateString from 'universal/utils/makeDateString'
import {PALETTE} from '../../../../styles/paletteV2'
// import DebugButton from './DebugButton'

const TabBody = styled('div')({
  backgroundColor: PALETTE.BACKGROUND.MAIN,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%'
})

const HeaderCopy = styled('div')({
  color: PALETTE.TEXT.LIGHT,
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

interface Props extends RouteComponentProps<{}> {}

const myDashboardTasksRoot = () =>
  import(/* webpackChunkName: MyDashboardTasksRoot */ 'universal/components/MyDashboardTasksRoot')
const myDashboardTimelineRoot = () =>
  import(/* webpackChunkName: MyDashboardTimelineRoot */ 'universal/components/MyDashboardTimelineRoot')

const UserDashMain = (props: Props) => {
  const {history, match} = props
  const isTasks = !!matchPath(location.pathname, {path: `${match.url}/tasks`})
  return (
    <DashMain>
      <Helmet title='My Dashboard | Parabol' />
      <DashHeader area='userDash'>
        <TopTabs activeIdx={isTasks ? 1 : 0}>
          <Tab label='TIMELINE' onClick={() => history.push('/me')} />
          <Tab label='TASKS' onClick={() => history.push('/me/tasks')} />
        </TopTabs>
        <HeaderCopy>
          {/*<DebugButton />*/}
          {makeDateString(new Date(), {showDay: true})}
          {' • '}
          <RallyLink>
            {getRallyLink()}
            {'!'}
          </RallyLink>
        </HeaderCopy>
      </DashHeader>
      <TabBody>
        <Switch>
          <AsyncRoute path={`${match.url}/tasks`} mod={myDashboardTasksRoot} />
          <AsyncRoute path={match.url} mod={myDashboardTimelineRoot} />
        </Switch>
      </TabBody>
    </DashMain>
  )
}

export default withRouter(UserDashMain)
