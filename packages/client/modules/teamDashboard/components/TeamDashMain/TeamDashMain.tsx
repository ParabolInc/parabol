import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamDashMainQuery} from '~/__generated__/TeamDashMainQuery.graphql'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import TeamDrawer from './TeamDrawer'
import TeamDashTasksTab from '../TeamDashTasksTab/TeamDashTasksTab'
import TeamDashActivityTab from '../TeamDashActivityTab/TeamDashActivityTab'
import {Route, Switch} from 'react-router-dom'

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
          featureFlags {
            retrosInDisguise
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
  useDocumentTitle(`Team Dashboard | ${teamName}`, teamName)

  return (
    <div className='flex h-full w-full'>
      <div className='relative flex h-full flex-1 flex-col overflow-auto'>
        <div className='flex w-full justify-start'>
          <TeamTasksHeaderContainer team={team} />
        </div>
        <Switch>
          <Route path='/team/:teamId/activity'>
            <TeamDashActivityTab teamRef={team} />
          </Route>
          {/*Fall back to tasks view if nothing is specified*/}
          <Route path='/team/:teamId'>
            <TeamDashTasksTab viewerRef={viewer} />
          </Route>
        </Switch>
        <AbsoluteFab hasRid={viewer.featureFlags.retrosInDisguise} />
      </div>
      <TeamDrawer viewer={viewer} />
    </div>
  )
}
export default TeamDashMain
