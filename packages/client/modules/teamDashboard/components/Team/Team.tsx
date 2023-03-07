import styled from '@emotion/styled'
import {ArrowBack} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy, ReactNode, Suspense} from 'react'
import {useFragment} from 'react-relay'
import {Layout} from '~/types/constEnums'
import DashContent from '../../../../components/Dashboard/DashContent'
import FlatButton from '../../../../components/FlatButton'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import {Team_team$key} from '../../../../__generated__/Team_team.graphql'
import EditableTeamName from '../EditTeamName/EditableTeamName'
// import DebugButton from '../../../userDashboard/components/UserDashMain/DebugButton'

const IconButton = styled(FlatButton)({
  color: PALETTE.SLATE_600,
  marginRight: 16,
  padding: '3px 0',
  width: 32,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const TeamDashHeaderInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  margin: '0 auto',
  maxWidth: Layout.SETTINGS_MAX_WIDTH,
  width: '100%'
})

const BackIcon = styled(ArrowBack)({
  color: 'inherit'
})

const UnpaidTeamModalRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'UnpaidTeamModalRoot' */ '../../containers/UnpaidTeamModal/UnpaidTeamModalRoot'
    )
)

interface Props {
  children: ReactNode
  dashSearch?: string
  team: Team_team$key | null
  isSettings: boolean
}

const SettingsHeader = styled('div')({
  padding: 16,
  display: 'flex',
  width: '100%'
})

const Team = (props: Props) => {
  const {history} = useRouter()
  const {children, isSettings, team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment Team_team on Team {
        id
        isPaid
        organization {
          lockedAt
        }
        ...EditableTeamName_team
      }
    `,
    teamRef
  )
  const teamId = team?.id
  if (!team || !teamId) return null
  const {isPaid, organization} = team
  const {lockedAt} = organization

  const goToTeamDashboard = () => {
    history.push(`/team/${teamId}/`)
  }

  const isLocked = !isPaid || !!lockedAt
  return (
    <>
      <Suspense fallback={''}>{isLocked && <UnpaidTeamModalRoot teamId={teamId} />}</Suspense>
      {isSettings && (
        <SettingsHeader>
          <TeamDashHeaderInner>
            <>
              <IconButton aria-label='Back to Team Dashboard' key='1' onClick={goToTeamDashboard}>
                <BackIcon />
              </IconButton>
              <EditableTeamName team={team} />
            </>
          </TeamDashHeaderInner>
        </SettingsHeader>
      )}
      <DashContent hasOverlay={isLocked}>{children}</DashContent>
    </>
  )
}

export default Team
