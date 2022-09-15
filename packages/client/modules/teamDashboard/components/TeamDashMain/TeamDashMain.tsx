import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamDashMainQuery} from '~/__generated__/TeamDashMainQuery.graphql'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import TeamColumnsContainer from '../../containers/TeamColumns/TeamColumnsContainer'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import TeamDrawer from './TeamDrawer'

const AbsoluteFab = styled(StartMeetingFAB)({
  position: 'absolute'
})

const RootBlock = styled('div')({
  display: 'flex',
  height: '100%',
  width: '100%'
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  position: 'relative'
})

const TasksHeader = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  width: '100%'
})

const TasksContent = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: 0,
  minHeight: 0,
  width: '100%'
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
          }
          ...TeamColumnsContainer_viewer
          ...TeamDrawer_viewer
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const team = viewer.team!
  const {name: teamName} = team
  useDocumentTitle(`Team Dashboard | ${teamName}`, teamName)

  return (
    <RootBlock>
      <TasksMain>
        <TasksHeader>
          <TeamTasksHeaderContainer team={team} />
        </TasksHeader>
        <TasksContent>
          <TeamColumnsContainer viewer={viewer} />
        </TasksContent>
        <AbsoluteFab />
      </TasksMain>
      <TeamDrawer viewer={viewer} />
    </RootBlock>
  )
}
export default TeamDashMain
