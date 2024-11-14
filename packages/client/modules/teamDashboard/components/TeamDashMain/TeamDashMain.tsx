import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Route, Switch} from 'react-router-dom'
import {TeamDashMainQuery} from '~/__generated__/TeamDashMainQuery.graphql'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import getTeamIdFromPathname from '../../../../utils/getTeamIdFromPathname'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import TeamDashActivityTab from '../TeamDashActivityTab/TeamDashActivityTab'
import TeamDashInsightsTab from '../TeamDashInsightsTab/TeamDashInsightsTab'
import TeamDashIntegrationsTab from '../TeamDashIntegrationsTab/TeamDashIntegrationsTab'
import TeamDashTasksTab from '../TeamDashTasksTab/TeamDashTasksTab'
import TeamDrawer from './TeamDrawer'

const AbsoluteFab = styled(StartMeetingFAB)({
  position: 'absolute'
})

interface Props {
  queryRef: PreloadedQuery<TeamDashMainQuery>
}

const TeamDashMain = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamDashMainQuery>(
    graphql`
      query TeamDashMainQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            name
            ...TeamTasksHeaderContainer_team
            ...TeamDashActivityTab_team
          }
          ...TeamDashTasksTab_viewer
          ...TeamDrawer_viewer
        }
      }
    `,
    queryRef
  )

  const {viewer} = data
  const team = viewer.team!
  const {name: teamName} = team
  const teamId = getTeamIdFromPathname()
  useDocumentTitle(`Team Dashboard | ${teamName}`, teamName)

  return (
    <div className='flex h-full w-full'>
      <div className='relative flex h-full flex-1 flex-col overflow-auto'>
        <div className='flex w-full justify-start'>
          <TeamTasksHeaderContainer team={team} />
        </div>
        <Switch>
          <Route path='/team/:teamId/tasks'>
            <TeamDashTasksTab viewerRef={viewer} />
          </Route>
          <Route path='/team/:teamId/integrations'>
            <TeamDashIntegrationsTab teamRef={teamId} />
          </Route>
          <Route path='/team/:teamId/insights'>
            <TeamDashInsightsTab teamId={teamId} />
          </Route>
          {/*Fall back to activity view if nothing is specified*/}
          <Route path='/team/:teamId'>
            <TeamDashActivityTab teamRef={team} />
          </Route>
        </Switch>
        <AbsoluteFab />
      </div>
      <TeamDrawer viewer={viewer} />
    </div>
  )
}
export default TeamDashMain
