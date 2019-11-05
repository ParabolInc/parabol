import {Team_team} from '../../../../__generated__/Team_team.graphql'
import React, {lazy, ReactNode, Suspense, useEffect} from 'react'
import styled from '@emotion/styled'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DashContent from '../../../../components/Dashboard/DashContent'
import DashHeader from '../../../../components/Dashboard/DashHeader'
import DashSearchControl from '../../../../components/Dashboard/DashSearchControl'
import DashboardAvatars from '../../../../components/DashboardAvatars/DashboardAvatars'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import IconLabel from '../../../../components/IconLabel'
import EditableTeamName from '../EditTeamName/EditableTeamName'
import TeamCallsToAction from '../TeamCallsToAction/TeamCallsToAction'
import {PALETTE} from '../../../../styles/paletteV2'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRouter from '../../../../hooks/useRouter'
// import DebugButton from '../../../userDashboard/components/UserDashMain/DebugButton'

const StyledButton = styled(FlatButton)({
  paddingLeft: '1rem',
  paddingRight: '1rem'
})

const IconButton = styled(StyledButton)({
  color: PALETTE.TEXT_GRAY,
  marginRight: 16,
  padding: '3px 0',
  width: 32,
  ':hover,:focus,:active': {
    color: PALETTE.TEXT_MAIN
  }
})

const TeamDashHeaderInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%'
})

const BackIcon = styled(Icon)({
  color: 'inherit'
})

const UnpaidTeamModalRoot = lazy(() =>
  import(
    /* webpackChunkName: 'UnpaidTeamModalRoot' */ '../../containers/UnpaidTeamModal/UnpaidTeamModalRoot'
  )
)

interface Props {
  children: ReactNode
  team: Team_team | null
  isSettings: boolean
}

const Team = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {children, isSettings, team} = props
  const teamId = team && team.id
  const contentFilter = team && team.contentFilter
  const setContentFilter = (nextValue: string) => {
    commitLocalUpdate(atmosphere, (store) => {
      const teamProxy = store.get(teamId!)
      teamProxy && teamProxy.setValue(nextValue, 'contentFilter')
    })
  }
  useEffect(() => {
    if (contentFilter) {
      setContentFilter('')
    }
  }, [teamId])

  if (!team || !teamId) return null
  const {isPaid} = team
  const updateFilter = (e) => {
    setContentFilter(e.target.value)
  }

  const goToTeamSettings = () => {
    history.push(`/team/${teamId}/settings/`)
  }

  const goToTeamDashboard = () => {
    history.push(`/team/${teamId}/`)
  }

  const hasOverlay = !isPaid

  return (
    <>
      <Suspense fallback={''}>{!isPaid && <UnpaidTeamModalRoot teamId={teamId} />}</Suspense>
      <DashHeader hasOverlay={hasOverlay} key={`team${isSettings ? 'Dash' : 'Settings'}Header`}>
        <TeamDashHeaderInner>
          {isSettings ? (
            <>
              <IconButton aria-label='Back to Team Dashboard' key='1' onClick={goToTeamDashboard}>
                <BackIcon>arrow_back</BackIcon>
              </IconButton>
              <EditableTeamName team={team} />
            </>
          ) : (
            <>
              <DashSearchControl onChange={updateFilter} placeholder='Search Tasks & Agenda' />
              <StyledButton aria-label='Team Settings' key='2' onClick={goToTeamSettings}>
                <IconLabel icon='settings' label='Team Settings' />
              </StyledButton>
              <DashboardAvatars team={team} />
              <TeamCallsToAction team={team} />
            </>
          )}
        </TeamDashHeaderInner>
      </DashHeader>
      <DashContent hasOverlay={hasOverlay}>{children}</DashContent>
    </>
  )
}

export default createFragmentContainer(Team, {
  team: graphql`
    fragment Team_team on Team {
      contentFilter
      id
      isPaid
      ...TeamCallsToAction_team
      ...DashboardAvatars_team
      ...EditableTeamName_team
    }
  `
})
